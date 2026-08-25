from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="TUDO MAIS FÁCIL API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ==================== MODELS ====================

class RepeatableItem(BaseModel):
    """Base for items that can be added multiple times to a wall."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


class Coluna(RepeatableItem):
    largura: float  # cm
    profundidade: float


class Viga(RepeatableItem):
    altura: float
    largura: float


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
    """Ponto genérico com distância lateral e altura em relação ao piso.
    O 'tipo' é opcional porque cada categoria já vive em seu próprio array
    (tomadas, interruptores, saidas_agua, saidas_esgoto, saidas_gas, registros_agua)."""
    tipo: Optional[str] = None
    distancia_centro: float
    lado: Literal["direito", "esquerdo"] = "direito"
    altura_piso: Optional[float] = None


class Wall(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str  # "Parede 01", "Parede 02"...
    numero: int = 1
    # Estrutura
    altura_pe_direito: float = 280  # cm
    largura_total: float = 400
    espessura_rodape: float = 1.5
    altura_rodape: float = 8
    colunas: List[Coluna] = []
    vigas: List[Viga] = []
    # Aberturas
    portas: List[Porta] = []
    janelas: List[Janela] = []
    # Instalações
    tomadas: List[PontoParede] = []
    interruptores: List[PontoParede] = []
    saidas_agua: List[PontoParede] = []
    saidas_esgoto: List[PontoParede] = []
    saidas_gas: List[PontoParede] = []
    registros_agua: List[PontoParede] = []
    # Referências de cor / material
    foto_parede_id: Optional[str] = None
    foto_piso_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class WallCreate(BaseModel):
    nome: Optional[str] = None
    altura_pe_direito: float = 280
    largura_total: float = 400
    espessura_rodape: float = 1.5
    altura_rodape: float = 8
    colunas: List[Coluna] = []
    vigas: List[Viga] = []
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
    tipo: Literal["parede", "piso"]
    data_base64: str  # image data
    cor_dominante_hex: str  # e.g. "#A38B6C"
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

@api_router.get("/")
async def root():
    return {"app": "TUDO MAIS FÁCIL", "version": "1.0.0", "status": "online"}


# ---------- Walls ----------

@api_router.get("/walls", response_model=List[Wall])
async def list_walls():
    docs = await db.walls.find({}, {"_id": 0}).sort("numero", 1).to_list(1000)
    for d in docs:
        for k in ("created_at", "updated_at"):
            if isinstance(d.get(k), str):
                d[k] = datetime.fromisoformat(d[k])
    return docs


@api_router.post("/walls", response_model=Wall)
async def create_wall(payload: WallCreate):
    # Determine next numero
    last = await db.walls.find({}, {"_id": 0, "numero": 1}).sort("numero", -1).limit(1).to_list(1)
    next_num = (last[0]["numero"] + 1) if last else 1
    nome = payload.nome or f"Parede {next_num:02d}"
    wall = Wall(**payload.model_dump(exclude={"nome"}), nome=nome, numero=next_num)
    doc = wall.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.walls.insert_one(doc)
    return wall


@api_router.get("/walls/{wall_id}", response_model=Wall)
async def get_wall(wall_id: str):
    doc = await db.walls.find_one({"id": wall_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Parede não encontrada")
    for k in ("created_at", "updated_at"):
        if isinstance(doc.get(k), str):
            doc[k] = datetime.fromisoformat(doc[k])
    return doc


@api_router.put("/walls/{wall_id}", response_model=Wall)
async def update_wall(wall_id: str, payload: WallCreate):
    existing = await db.walls.find_one({"id": wall_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Parede não encontrada")
    data = payload.model_dump(exclude_unset=True)
    if "nome" in data and not data["nome"]:
        data.pop("nome")
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.walls.update_one({"id": wall_id}, {"$set": data})
    updated = await db.walls.find_one({"id": wall_id}, {"_id": 0})
    for k in ("created_at", "updated_at"):
        if isinstance(updated.get(k), str):
            updated[k] = datetime.fromisoformat(updated[k])
    return updated


@api_router.delete("/walls/{wall_id}")
async def delete_wall(wall_id: str):
    res = await db.walls.delete_one({"id": wall_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Parede não encontrada")
    return {"ok": True, "deleted": wall_id}


@api_router.get("/walls/{wall_id}/export")
async def export_wall_for_sketchup(wall_id: str):
    """Exports the wall data in a SketchUp-plugin-friendly JSON format.
    Units are converted to millimeters (SketchUp friendly)."""
    doc = await db.walls.find_one({"id": wall_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Parede não encontrada")

    def cm_to_mm(v):
        try:
            return round(float(v) * 10.0, 2)
        except Exception:
            return v

    # Fetch color references
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
async def create_photo(payload: PhotoCreate):
    photo = Photo(**payload.model_dump())
    doc = photo.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.photos.insert_one(doc)
    return PhotoSummary(
        id=photo.id, tipo=photo.tipo,
        cor_dominante_hex=photo.cor_dominante_hex,
        created_at=photo.created_at,
    )


@api_router.get("/photos", response_model=List[PhotoSummary])
async def list_photos(tipo: Optional[str] = None):
    query = {}
    if tipo:
        query["tipo"] = tipo
    docs = await db.photos.find(query, {"_id": 0, "data_base64": 0}).sort("created_at", -1).to_list(1000)
    for d in docs:
        if isinstance(d.get("created_at"), str):
            d["created_at"] = datetime.fromisoformat(d["created_at"])
    return docs


@api_router.get("/photos/{photo_id}")
async def get_photo(photo_id: str):
    doc = await db.photos.find_one({"id": photo_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Foto não encontrada")
    return doc


@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str):
    res = await db.photos.delete_one({"id": photo_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Foto não encontrada")
    return {"ok": True, "deleted": photo_id}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
