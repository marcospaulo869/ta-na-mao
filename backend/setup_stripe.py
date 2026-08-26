"""Setup Stripe catalog for TUDO MAIS FÁCIL. Run once (idempotent)."""
import os
import stripe
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")
stripe.api_key = os.environ["STRIPE_SECRET_KEY"]

CATALOG = [
    {
        "emergent_product_id": "tmf_pro",
        "name": "Tudo Mais Fácil PRO",
        "tax_code": "txcd_10103001",  # SaaS
        "prices": [
            {"lookup_key": "tmf_pro_monthly", "amount": 3990, "currency": "brl", "interval": "month"},
            {"lookup_key": "tmf_pro_annual", "amount": 39900, "currency": "brl", "interval": "year"},
        ],
    },
]


def get_or_create_product(entry):
    for p in stripe.Product.list(active=True, limit=100).auto_paging_iter():
        if p.metadata.get("emergent_product_id") == entry["emergent_product_id"]:
            print(f"[=] Product exists: {p.id} ({entry['name']})")
            return p
    p = stripe.Product.create(
        name=entry["name"],
        tax_code=entry.get("tax_code"),
        metadata={"managed_by": "emergent", "emergent_product_id": entry["emergent_product_id"]},
    )
    print(f"[+] Product created: {p.id} ({entry['name']})")
    return p


def ensure_price(product, price_def):
    existing = stripe.Price.list(lookup_keys=[price_def["lookup_key"]], active=True, limit=1).data
    if existing and (
        existing[0].unit_amount != price_def["amount"] or existing[0].currency != price_def["currency"]
    ):
        stripe.Price.modify(existing[0].id, active=False)
        existing = []
    if existing:
        print(f"[=] Price exists: {existing[0].id} ({price_def['lookup_key']})")
        return existing[0]
    kwargs = dict(
        product=product.id,
        unit_amount=price_def["amount"],
        currency=price_def["currency"],
        lookup_key=price_def["lookup_key"],
        transfer_lookup_key=True,
    )
    if price_def.get("interval"):
        kwargs["recurring"] = {"interval": price_def["interval"]}
    p = stripe.Price.create(**kwargs)
    print(f"[+] Price created: {p.id} ({price_def['lookup_key']} - {price_def['amount']/100:.2f} {price_def['currency'].upper()})")
    return p


if __name__ == "__main__":
    for entry in CATALOG:
        prod = get_or_create_product(entry)
        for pd in entry["prices"]:
            ensure_price(prod, pd)
    print("\n✓ Catalog setup complete.")
