from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

from auth import router as auth_router, get_current_user, ensure_indexes, seed_admin
from payments import router as payments_router
from projects import router as projects_router
from voice import router as voice_router
from vision import router as vision_router
from pdf_report import build_wall_pdf, build_project_pdf
from fastapi.responses import Response as FastResponse

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="TÁ NA MÃO API")
app.state.db = db

FREEMIUM_WALL_LIMIT = 10
PRO_PLANS = {"pro_monthly", "pro_annual", "pro"}


# ==================== MODELS ====================

class RepeatableItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class Coluna(RepeatableItem):
    largura: float
    profundidade: float


class Viga(RepeatableItem):
    altura: float
    largura: float


class ParedeAngulo(RepeatableItem):
    """Wall segment attached at an angle (e.g. cut corner at 135°)."""
    comprimento: float
    altura: float
    angulo: float = 135


class Porta(RepeatableItem):
    largura_vao: float
    altura_vao: float
    largura_vista: float = 0
    espessura_vista: float = 0


class Janela(RepeatableItem):
    largura_vista: float
    largura_vao: float
    altura_vao: float


class PontoParede(RepeatableItem):
    tipo: Optional[str] = None
    distancia_centro: float
    lado: Literal["direito", "esquerdo"] = "direito"
    altura_piso: Optional[float] = None


class Wall(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    nome: str
    numero: int = 1
    altura_pe_direito: float = 280
    largura_total: float = 400
    espessura_rodape: float = 1.5
    altura_rodape: float = 8
    colunas: List[Coluna] = []
    vigas: List[Viga] = []
    paredes_angulo: List[ParedeAngulo] = []
    portas: List[Porta] = []
    janelas: List[Janela] = []
    tomadas: List[PontoParede] = []
    interruptores: List[PontoParede] = []
    saidas_agua: List[PontoParede] = []
    saidas_esgoto: List[PontoParede] = []
    saidas_gas: List[PontoParede] = []
    registros_agua: List[PontoParede] = []
    foto_parede_id: Optional[str] = None
    foto_piso_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WallCreate(BaseModel):
    nome: Optional[str] = None
    project_id: Optional[str] = None
    altura_pe_direito: float = 280
    largura_total: float = 400
    espessura_rodape: float = 1.5
    altura_rodape: float = 8
    colunas: List[Coluna] = []
    vigas: List[Viga] = []
    paredes_angulo: List[ParedeAngulo] = []
    portas: List[Porta] = []
    janelas: List[Janela] = []
    tomadas: List[PontoParede] = []
    interruptores: List[PontoParede] = []
    saidas_agua: List[PontoParede] = []
    saidas_esgoto: List[PontoParede] = []
    saidas_gas: List[PontoParede] = []
    registros_agua: List[PontoParede] = []
    foto_parede_id: Optional[str] = None
    foto_piso_id: Optional[str] = None


class Photo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    tipo: Literal["parede", "piso"]
    data_base64: str
    cor_dominante_hex: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PhotoCreate(BaseModel):
    tipo: Literal["parede", "piso"]
    data_base64: str
    cor_dominante_hex: str


class PhotoSummary(BaseModel):
    id: str
    tipo: str
    cor_dominante_hex: str
    created_at: datetime


# ==================== ROUTES ====================

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"app": "TÁ NA MÃO", "version": "1.1.0", "status": "online"}


@api_router.get("/limits")
async def get_limits(user=Depends(get_current_user)):
    """Return the current user's wall usage vs. plan limits."""
    walls_count = await db.walls.count_documents({"user_id": user["user_id"]})
    is_pro = user.get("plan") in PRO_PLANS
    return {
        "plan": user.get("plan", "free"),
        "is_pro": is_pro,
        "walls_used": walls_count,
        "walls_limit": None if is_pro else FREEMIUM_WALL_LIMIT,
    }


# ---------- Walls ----------

def _sanitize_wall(doc: dict) -> dict:
    for k in ("created_at", "updated_at"):
        if isinstance(doc.get(k), str):
            doc[k] = datetime.fromisoformat(doc[k])
    return doc


@api_router.get("/walls", response_model=List[Wall])
async def list_walls(user=Depends(get_current_user), project_id: Optional[str] = None):
    query = {"user_id": user["user_id"]}
    if project_id:
        query["project_id"] = project_id
    docs = await db.walls.find(query, {"_id": 0}).sort("numero", 1).to_list(1000)
    return [_sanitize_wall(d) for d in docs]


@api_router.post("/walls", response_model=Wall)
async def create_wall(payload: WallCreate, user=Depends(get_current_user)):
    # Enforce freemium limit
    if user.get("plan", "free") not in PRO_PLANS:
        existing = await db.walls.count_documents({"user_id": user["user_id"]})
        if existing >= FREEMIUM_WALL_LIMIT:
            raise HTTPException(
                status_code=402,
                detail=(
                    f"Limite gratuito de {FREEMIUM_WALL_LIMIT} paredes atingido. "
                    "Assine o plano PRO para paredes ilimitadas."
                ),
            )

    # Auto-number per user
    last = await db.walls.find(
        {"user_id": user["user_id"]}, {"_id": 0, "numero": 1}
    ).sort("numero", -1).limit(1).to_list(1)
    next_num = (last[0]["numero"] + 1) if last else 1
    nome = payload.nome or f"Parede {next_num:02d}"
    wall = Wall(**payload.model_dump(exclude={"nome"}), nome=nome, numero=next_num, user_id=user["user_id"])
    doc = wall.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.walls.insert_one(doc)
    return wall


@api_router.get("/walls/{wall_id}", response_model=Wall)
async def get_wall(wall_id: str, user=Depends(get_current_user)):
    doc = await db.walls.find_one({"id": wall_id, "user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Parede não encontrada")
    return _sanitize_wall(doc)


@api_router.put("/walls/{wall_id}", response_model=Wall)
async def update_wall(wall_id: str, payload: WallCreate, user=Depends(get_current_user)):
    existing = await db.walls.find_one({"id": wall_id, "user_id": user["user_id"]}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Parede não encontrada")
    data = payload.model_dump(exclude_unset=True)
    if "nome" in data and not data["nome"]:
        data.pop("nome")
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.walls.update_one({"id": wall_id, "user_id": user["user_id"]}, {"$set": data})
    updated = await db.walls.find_one({"id": wall_id, "user_id": user["user_id"]}, {"_id": 0})
    return _sanitize_wall(updated)


@api_router.delete("/walls/{wall_id}")
async def delete_wall(wall_id: str, user=Depends(get_current_user)):
    res = await db.walls.delete_one({"id": wall_id, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Parede não encontrada")
    return {"ok": True, "deleted": wall_id}


@api_router.get("/walls/{wall_id}/pdf")
async def wall_pdf(wall_id: str, user=Depends(get_current_user)):
    doc = await db.walls.find_one({"id": wall_id, "user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Parede não encontrada")
    # Resolve photo colors
    if doc.get("foto_parede_id"):
        p = await db.photos.find_one({"id": doc["foto_parede_id"]}, {"_id": 0, "cor_dominante_hex": 1})
        doc["cor_parede_hex"] = p["cor_dominante_hex"] if p else None
    if doc.get("foto_piso_id"):
        p = await db.photos.find_one({"id": doc["foto_piso_id"]}, {"_id": 0, "cor_dominante_hex": 1})
        doc["cor_piso_hex"] = p["cor_dominante_hex"] if p else None
    pdf_bytes = build_wall_pdf(doc)
    return FastResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{doc["nome"].replace(" ", "_")}.pdf"'},
    )


@api_router.get("/projects/{project_id}/pdf")
async def project_pdf(project_id: str, user=Depends(get_current_user)):
    proj = await db.projects.find_one({"id": project_id, "user_id": user["user_id"]}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    walls = await db.walls.find(
        {"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0}
    ).sort("numero", 1).to_list(500)
    # Enrich with colors
    for w in walls:
        if w.get("foto_parede_id"):
            p = await db.photos.find_one({"id": w["foto_parede_id"]}, {"_id": 0, "cor_dominante_hex": 1})
            w["cor_parede_hex"] = p["cor_dominante_hex"] if p else None
        if w.get("foto_piso_id"):
            p = await db.photos.find_one({"id": w["foto_piso_id"]}, {"_id": 0, "cor_dominante_hex": 1})
            w["cor_piso_hex"] = p["cor_dominante_hex"] if p else None
    pdf_bytes = build_project_pdf(proj, walls)
    return FastResponse(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{proj["nome"].replace(" ", "_")}.pdf"'},
    )


@api_router.get("/walls/{wall_id}/export")
async def export_wall_for_sketchup(wall_id: str, request: Request):
    """Export endpoint: accepts either an authenticated user OR (for SketchUp plugin
    running standalone) a valid session cookie/token. Users can only export their own walls."""
    from auth import get_current_user_optional
    user = await get_current_user_optional(request)
    query = {"id": wall_id}
    if user:
        query["user_id"] = user["user_id"]
    else:
        # Without auth, allow export only if wall exists and has no user_id (legacy) — safer for MVP
        query["user_id"] = None

    doc = await db.walls.find_one(query, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Parede não encontrada")

    def cm_to_mm(v):
        try:
            return round(float(v) * 10.0, 2)
        except Exception:
            return v

    cor_parede = None
    cor_piso = None
    if doc.get("foto_parede_id"):
        p = await db.photos.find_one({"id": doc["foto_parede_id"]}, {"_id": 0, "cor_dominante_hex": 1})
        cor_parede = p["cor_dominante_hex"] if p else None
    if doc.get("foto_piso_id"):
        p = await db.photos.find_one({"id": doc["foto_piso_id"]}, {"_id": 0, "cor_dominante_hex": 1})
        cor_piso = p["cor_dominante_hex"] if p else None

    exported = {
        "format": "TUDO_MAIS_FACIL_WALL",
        "format_version": "1.0",
        "unit": "mm",
        "wall": {
            "id": doc["id"],
            "nome": doc["nome"],
            "numero": doc["numero"],
            "altura_pe_direito": cm_to_mm(doc["altura_pe_direito"]),
            "largura_total": cm_to_mm(doc["largura_total"]),
            "altura_rodape": cm_to_mm(doc["altura_rodape"]),
            "espessura_rodape": cm_to_mm(doc["espessura_rodape"]),
            "colunas": [{"largura": cm_to_mm(c["largura"]), "profundidade": cm_to_mm(c["profundidade"])} for c in doc.get("colunas", [])],
            "vigas": [{"altura": cm_to_mm(v["altura"]), "largura": cm_to_mm(v["largura"])} for v in doc.get("vigas", [])],
            "paredes_angulo": [{"comprimento": cm_to_mm(a["comprimento"]), "altura": cm_to_mm(a["altura"]), "angulo": a.get("angulo", 135)} for a in doc.get("paredes_angulo", [])],
            "portas": [{"largura_vao": cm_to_mm(p["largura_vao"]), "altura_vao": cm_to_mm(p["altura_vao"]), "largura_vista": cm_to_mm(p.get("largura_vista", 0)), "espessura_vista": cm_to_mm(p.get("espessura_vista", 0))} for p in doc.get("portas", [])],
            "janelas": [{"largura_vista": cm_to_mm(j["largura_vista"]), "largura_vao": cm_to_mm(j["largura_vao"]), "altura_vao": cm_to_mm(j["altura_vao"])} for j in doc.get("janelas", [])],
            "pontos": {
                "tomadas": [_export_ponto(p) for p in doc.get("tomadas", [])],
                "interruptores": [_export_ponto(p) for p in doc.get("interruptores", [])],
                "saidas_agua": [_export_ponto(p) for p in doc.get("saidas_agua", [])],
                "saidas_esgoto": [_export_ponto(p) for p in doc.get("saidas_esgoto", [])],
                "saidas_gas": [_export_ponto(p) for p in doc.get("saidas_gas", [])],
                "registros_agua": [_export_ponto(p) for p in doc.get("registros_agua", [])],
            },
            "cores": {
                "parede_hex": cor_parede,
                "piso_hex": cor_piso,
            },
        },
    }

    headers = {
        "Content-Disposition": f'attachment; filename="{doc["nome"].replace(" ", "_")}.tmf.json"'
    }
    return JSONResponse(content=exported, headers=headers)


def _export_ponto(p: dict) -> dict:
    def cm_to_mm(v):
        if v is None:
            return None
        try:
            return round(float(v) * 10.0, 2)
        except Exception:
            return v
    return {
        "distancia_centro": cm_to_mm(p.get("distancia_centro")),
        "lado": p.get("lado", "direito"),
        "altura_piso": cm_to_mm(p.get("altura_piso")),
    }


# ---------- Photos ----------

@api_router.post("/photos", response_model=PhotoSummary)
async def create_photo(payload: PhotoCreate, user=Depends(get_current_user)):
    photo = Photo(**payload.model_dump(), user_id=user["user_id"])
    doc = photo.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.photos.insert_one(doc)
    return PhotoSummary(
        id=photo.id, tipo=photo.tipo,
        cor_dominante_hex=photo.cor_dominante_hex,
        created_at=photo.created_at,
    )


@api_router.get("/photos", response_model=List[PhotoSummary])
async def list_photos(user=Depends(get_current_user), tipo: Optional[str] = None):
    query = {"user_id": user["user_id"]}
    if tipo:
        query["tipo"] = tipo
    docs = await db.photos.find(query, {"_id": 0, "data_base64": 0}).sort("created_at", -1).to_list(1000)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.get("/photos/{photo_id}")
async def get_photo(photo_id: str, user=Depends(get_current_user)):
    doc = await db.photos.find_one({"id": photo_id, "user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Foto não encontrada")
    return doc


@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, user=Depends(get_current_user)):
    res = await db.photos.delete_one({"id": photo_id, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Foto não encontrada")
    return {"ok": True, "deleted": photo_id}


# Register routers
app.include_router(api_router)
app.include_router(auth_router)
app.include_router(payments_router)
app.include_router(projects_router)
app.include_router(voice_router)
app.include_router(vision_router)


# Stripe delivers to /api/stripe/webhook by convention — expose an alias
@app.post("/api/stripe/webhook")
async def stripe_webhook_alias(request: Request):
    from payments import _process_webhook
    return await _process_webhook(request)

# CORS
frontend_url = os.environ.get("FRONTEND_URL", "*")
allow_origins = [frontend_url] if frontend_url != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup():
    await ensure_indexes(db)
    await seed_admin(db)
    logger.info("TÁ NA MÃO — startup complete")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
