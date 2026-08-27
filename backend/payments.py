"""Stripe payments module (Flow A — claimable sandbox).
Two plans: tmf_pro_monthly (R$ 39,90) and tmf_pro_annual (R$ 399).
"""
from __future__ import annotations

import os
import stripe
from datetime import datetime, timezone, timedelta
from typing import Optional, Literal
from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorDatabase
from auth import get_current_user

stripe.api_key = os.environ["STRIPE_SECRET_KEY"]
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

PLAN_BY_LOOKUP = {
    "tmf_pro_monthly":     {"code": "pro_monthly", "days": 30},
    "tmf_pro_annual":      {"code": "pro_annual", "days": 365},
    "plugin_basic_monthly":{"code": "plugin_basic", "days": 30},
    "plugin_pro_monthly":  {"code": "plugin_pro", "days": 30},
}


class CheckoutRequest(BaseModel):
    lookup_key: Literal[
        "tmf_pro_monthly",
        "tmf_pro_annual",
        "plugin_basic_monthly",
        "plugin_pro_monthly",
    ]
    origin_url: str = Field(min_length=8)


router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("/plans")
async def list_plans():
    """Public: list available plans + prices (for the pricing page)."""
    result = []
    for lk, meta in PLAN_BY_LOOKUP.items():
        prices = stripe.Price.list(lookup_keys=[lk], active=True, limit=1).data
        if not prices:
            continue
        p = prices[0]
        result.append({
            "lookup_key": lk,
            "code": meta["code"],
            "amount": p.unit_amount,
            "currency": p.currency,
            "interval": p.recurring.interval if p.recurring else None,
            "display_price": f"R$ {p.unit_amount/100:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
        })
    return result


@router.post("/checkout")
async def create_checkout(payload: CheckoutRequest, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    prices = stripe.Price.list(lookup_keys=[payload.lookup_key], active=True, limit=1).data
    if not prices:
        raise HTTPException(500, "Plano não encontrado no Stripe.")
    price = prices[0]

    kwargs = dict(
        line_items=[{"price": price.id, "quantity": 1}],
        mode="subscription",
        success_url=f"{payload.origin_url}/pagamento/sucesso?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{payload.origin_url}/pagamento/cancelado",
        client_reference_id=user["user_id"],
        metadata={
            "user_id": user["user_id"],
            "lookup_key": payload.lookup_key,
        },
        customer_email=user["email"],
    )
    # Country BR — non-SMP for now, use calc_only fallback style but DIY for simplicity in sandbox
    session = stripe.checkout.Session.create(**kwargs)

    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "user_id": user["user_id"],
        "lookup_key": payload.lookup_key,
        "amount": price.unit_amount,
        "currency": price.currency,
        "status": "initiated",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"checkout_url": session.url, "session_id": session.id}


@router.get("/status/{session_id}")
async def get_checkout_status(session_id: str, request: Request):
    """Public endpoint (no auth) so the /pagamento/sucesso page can poll."""
    db: AsyncIOMotorDatabase = request.app.state.db
    record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not record:
        raise HTTPException(404, "Transação não encontrada.")

    # Poll Stripe if still pending (webhook fallback)
    if record.get("payment_status") != "paid":
        try:
            s = stripe.checkout.Session.retrieve(session_id)
            if s.payment_status == "paid" or s.status == "complete":
                await _mark_paid_and_upgrade_user(db, session_id, s)
                record = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        except stripe.error.StripeError:
            pass

    return {
        "session_id": record["session_id"],
        "status": record["status"],
        "payment_status": record["payment_status"],
    }


async def _mark_paid_and_upgrade_user(db: AsyncIOMotorDatabase, session_id: str, stripe_session) -> None:
    """Idempotent: only acts if payment_status != 'paid' yet."""
    tx = await db.payment_transactions.find_one({"session_id": session_id})
    if not tx or tx.get("payment_status") == "paid":
        return
    lookup = tx.get("lookup_key")
    plan_meta = PLAN_BY_LOOKUP.get(lookup)
    plan_code = plan_meta["code"] if plan_meta else "pro_monthly"
    days = plan_meta["days"] if plan_meta else 30
    expires = datetime.now(timezone.utc) + timedelta(days=days)

    await db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {
            "status": "completed",
            "payment_status": "paid",
            "stripe_subscription_id": getattr(stripe_session, "subscription", None),
            "stripe_customer_id": getattr(stripe_session, "customer", None),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    user_id = tx.get("user_id")
    if user_id:
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "plan": plan_code,
                "plan_expires_at": expires.isoformat(),
                "stripe_customer_id": getattr(stripe_session, "customer", None),
                "stripe_subscription_id": getattr(stripe_session, "subscription", None),
            }},
        )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Stripe webhook — path /api/payments/webhook."""
    return await _process_webhook(request)


async def _process_webhook(request: Request):
    db: AsyncIOMotorDatabase = request.app.state.db
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Assinatura inválida")

    obj = event["data"]["object"]
    etype = event["type"]

    if etype == "checkout.session.completed":
        await _mark_paid_and_upgrade_user(db, obj["id"], type("S", (), obj)())
    elif etype == "customer.subscription.deleted":
        customer_id = obj.get("customer")
        if customer_id:
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"plan": "free", "plan_expires_at": None}},
            )
    return {"received": True}
