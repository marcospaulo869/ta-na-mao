"""Authentication module — unified JWT email/password + Emergent Google OAuth.
Both flows produce a session_token stored in `user_sessions` collection.
"""
from __future__ import annotations

import os
import uuid
import bcrypt
import jwt
import httpx
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Response, Depends, status
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from motor.motor_asyncio import AsyncIOMotorDatabase

JWT_ALGO = "HS256"
JWT_EXPIRY_DAYS = 7
COOKIE_NAME = "session_token"
COOKIE_MAX_AGE = JWT_EXPIRY_DAYS * 24 * 3600
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


# ---------- Models ----------

class UserPublic(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    plan: str = "free"
    plan_expires_at: Optional[datetime] = None
    walls_count: int = 0
    created_at: datetime


class RegisterInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=2, max_length=80)


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionInput(BaseModel):
    session_id: str = Field(min_length=8)


# ---------- Helpers ----------

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def _jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def create_session_token(user_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS)
    return jwt.encode(
        {"sub": user_id, "exp": exp, "jti": secrets.token_hex(8)},
        _jwt_secret(),
        algorithm=JWT_ALGO,
    )


def _set_session_cookie(resp: Response, token: str) -> None:
    resp.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )


def _clear_session_cookie(resp: Response) -> None:
    resp.delete_cookie(COOKIE_NAME, path="/")


async def _serialize_user(db: AsyncIOMotorDatabase, doc: dict) -> UserPublic:
    """Adds computed fields (walls_count) and strips sensitive."""
    walls_count = await db.walls.count_documents({"user_id": doc["user_id"]})
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    if isinstance(doc.get("plan_expires_at"), str):
        doc["plan_expires_at"] = datetime.fromisoformat(doc["plan_expires_at"])
    return UserPublic(
        user_id=doc["user_id"],
        email=doc["email"],
        name=doc.get("name", ""),
        picture=doc.get("picture"),
        plan=doc.get("plan", "free"),
        plan_expires_at=doc.get("plan_expires_at"),
        walls_count=walls_count,
        created_at=doc.get("created_at") or datetime.now(timezone.utc),
    )


# ---------- Auth dependency ----------

async def get_current_user_optional(request: Request) -> Optional[dict]:
    """Returns the user dict or None. Never raises."""
    db: AsyncIOMotorDatabase = request.app.state.db
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        hdr = request.headers.get("Authorization", "")
        if hdr.lower().startswith("bearer "):
            token = hdr[7:]
    if not token:
        return None
    try:
        payload = jwt.decode(token, _jwt_secret(), algorithms=[JWT_ALGO])
    except jwt.PyJWTError:
        return None
    user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    return user


async def get_current_user(request: Request) -> dict:
    user = await get_current_user_optional(request)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado")
    return user


# ---------- Router ----------

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic)
async def register(payload: RegisterInput, request: Request, response: Response):
    db: AsyncIOMotorDatabase = request.app.state.db
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(400, "Este e-mail já está cadastrado.")
    user_doc = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": email,
        "name": payload.name.strip(),
        "password_hash": hash_password(payload.password),
        "google_id": None,
        "picture": None,
        "plan": "free",
        "plan_expires_at": None,
        "stripe_customer_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_session_token(user_doc["user_id"])
    _set_session_cookie(response, token)
    return await _serialize_user(db, user_doc)


@router.post("/login", response_model=UserPublic)
async def login(payload: LoginInput, request: Request, response: Response):
    db: AsyncIOMotorDatabase = request.app.state.db
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash"):
        raise HTTPException(401, "E-mail ou senha incorretos.")
    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(401, "E-mail ou senha incorretos.")
    token = create_session_token(user["user_id"])
    _set_session_cookie(response, token)
    return await _serialize_user(db, user)


@router.post("/google", response_model=UserPublic)
async def google_login(payload: GoogleSessionInput, request: Request, response: Response):
    """Exchange Emergent OAuth session_id for a user account + our own session cookie."""
    db: AsyncIOMotorDatabase = request.app.state.db
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            r = await client.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": payload.session_id})
            r.raise_for_status()
            data = r.json()
        except Exception as e:
            raise HTTPException(401, f"Falha ao validar sessão Google: {e}")

    email = data.get("email", "").lower().strip()
    name = data.get("name") or email.split("@")[0]
    picture = data.get("picture")
    google_id = data.get("id")
    if not email:
        raise HTTPException(401, "Sessão Google não retornou e-mail.")

    existing = await db.users.find_one({"email": email})
    if existing:
        # link google_id if missing
        updates = {}
        if not existing.get("google_id"):
            updates["google_id"] = google_id
        if picture and not existing.get("picture"):
            updates["picture"] = picture
        if updates:
            await db.users.update_one({"user_id": existing["user_id"]}, {"$set": updates})
            existing.update(updates)
        user_doc = existing
    else:
        user_doc = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": name,
            "password_hash": None,
            "google_id": google_id,
            "picture": picture,
            "plan": "free",
            "plan_expires_at": None,
            "stripe_customer_id": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user_doc)

    token = create_session_token(user_doc["user_id"])
    _set_session_cookie(response, token)
    return await _serialize_user(db, user_doc)


@router.get("/me", response_model=UserPublic)
async def me(request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    return await _serialize_user(db, user)


@router.post("/logout")
async def logout(response: Response):
    _clear_session_cookie(response)
    return {"ok": True}


async def ensure_indexes(db: AsyncIOMotorDatabase):
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.walls.create_index("user_id")


async def seed_admin(db: AsyncIOMotorDatabase):
    email = os.environ.get("ADMIN_EMAIL", "admin@tudomaisfacil.com").lower().strip()
    password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": email})
    if not existing:
        await db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": "Administrador",
            "password_hash": hash_password(password),
            "google_id": None,
            "picture": None,
            "plan": "pro_annual",
            "plan_expires_at": None,
            "stripe_customer_id": None,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not existing.get("password_hash") or not verify_password(password, existing["password_hash"]):
        await db.users.update_one(
            {"email": email},
            {"$set": {"password_hash": hash_password(password), "role": "admin", "plan": "pro_annual"}}
        )
