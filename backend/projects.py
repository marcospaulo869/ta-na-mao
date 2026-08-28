"""Projects module — group walls into projects (Cozinha, Sala, Quarto, etc.).
Each project belongs to a user, holds a client name/phone/address, and references walls.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field, ConfigDict
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth import get_current_user


class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    nome: str
    cliente_nome: Optional[str] = None
    cliente_telefone: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProjectCreate(BaseModel):
    nome: str
    cliente_nome: Optional[str] = None
    cliente_telefone: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None


class ProjectDetail(BaseModel):
    project: Project
    walls: List[dict]  # simplified wall docs


router = APIRouter(prefix="/api/projects", tags=["projects"])


def _sanitize_dates(d: dict) -> dict:
    for k in ("created_at", "updated_at"):
        if isinstance(d.get(k), str):
            d[k] = datetime.fromisoformat(d[k])
    return d


@router.get("", response_model=List[Project])
async def list_projects(request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    docs = await db.projects.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_sanitize_dates(d) for d in docs]


@router.post("", response_model=Project)
async def create_project(payload: ProjectCreate, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    proj = Project(**payload.model_dump(), user_id=user["user_id"])
    doc = proj.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    await db.projects.insert_one(doc)
    return proj


@router.get("/{project_id}", response_model=ProjectDetail)
async def get_project(project_id: str, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    doc = await db.projects.find_one({"id": project_id, "user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Projeto não encontrado")
    walls = await db.walls.find(
        {"project_id": project_id, "user_id": user["user_id"]}, {"_id": 0}
    ).sort("numero", 1).to_list(500)
    for w in walls:
        _sanitize_dates(w)
    return ProjectDetail(project=Project(**_sanitize_dates(doc)), walls=walls)


@router.put("/{project_id}", response_model=Project)
async def update_project(project_id: str, payload: ProjectCreate, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    existing = await db.projects.find_one({"id": project_id, "user_id": user["user_id"]}, {"_id": 0})
    if not existing:
        raise HTTPException(404, "Projeto não encontrado")
    data = payload.model_dump(exclude_unset=True)
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.projects.update_one({"id": project_id, "user_id": user["user_id"]}, {"$set": data})
    updated = await db.projects.find_one({"id": project_id, "user_id": user["user_id"]}, {"_id": 0})
    return Project(**_sanitize_dates(updated))


@router.delete("/{project_id}")
async def delete_project(project_id: str, request: Request, user=Depends(get_current_user)):
    """Delete project. Walls belonging to it are detached (project_id -> null), NOT deleted."""
    db: AsyncIOMotorDatabase = request.app.state.db
    res = await db.projects.delete_one({"id": project_id, "user_id": user["user_id"]})
    if res.deleted_count == 0:
        raise HTTPException(404, "Projeto não encontrado")
    await db.walls.update_many(
        {"project_id": project_id, "user_id": user["user_id"]},
        {"$unset": {"project_id": ""}},
    )
    return {"ok": True, "deleted": project_id}


@router.post("/{project_id}/walls/{wall_id}")
async def attach_wall(project_id: str, wall_id: str, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    proj = await db.projects.find_one({"id": project_id, "user_id": user["user_id"]}, {"_id": 0})
    if not proj:
        raise HTTPException(404, "Projeto não encontrado")
    res = await db.walls.update_one(
        {"id": wall_id, "user_id": user["user_id"]},
        {"$set": {"project_id": project_id, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Parede não encontrada")
    return {"ok": True}


@router.delete("/{project_id}/walls/{wall_id}")
async def detach_wall(project_id: str, wall_id: str, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    res = await db.walls.update_one(
        {"id": wall_id, "user_id": user["user_id"], "project_id": project_id},
        {"$unset": {"project_id": ""}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Parede não encontrada no projeto")
    return {"ok": True}


# ---------- Client References (visual inspiration attached to the project) ----------


class ClientReference(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    user_id: str
    kind: str  # "image" | "url"
    data: str  # base64 (image) or url (url)
    mime: Optional[str] = None
    caption: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ClientReferenceCreate(BaseModel):
    kind: str  # "image" | "url"
    data: str
    mime: Optional[str] = None
    caption: Optional[str] = None


@router.get("/{project_id}/references", response_model=List[dict])
async def list_references(project_id: str, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    proj = await db.projects.find_one({"id": project_id, "user_id": user["user_id"]}, {"_id": 0, "id": 1})
    if not proj:
        raise HTTPException(404, "Projeto não encontrado")
    docs = await db.client_references.find(
        {"project_id": project_id, "user_id": user["user_id"]},
        {"_id": 0},
    ).sort("created_at", -1).to_list(200)
    return docs


@router.post("/{project_id}/references", response_model=dict)
async def create_reference(project_id: str, payload: ClientReferenceCreate, request: Request, user=Depends(get_current_user)):
    if payload.kind not in ("image", "url"):
        raise HTTPException(400, "kind precisa ser 'image' ou 'url'")
    if payload.kind == "image" and len(payload.data) > 8 * 1024 * 1024:
        raise HTTPException(400, "Imagem muito grande (máx ~6MB reais).")
    db: AsyncIOMotorDatabase = request.app.state.db
    proj = await db.projects.find_one({"id": project_id, "user_id": user["user_id"]}, {"_id": 0, "id": 1})
    if not proj:
        raise HTTPException(404, "Projeto não encontrado")
    ref = ClientReference(
        project_id=project_id,
        user_id=user["user_id"],
        **payload.model_dump(),
    )
    doc = ref.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.client_references.insert_one(doc)
    doc.pop("_id", None)
    return doc


@router.delete("/{project_id}/references/{ref_id}")
async def delete_reference(project_id: str, ref_id: str, request: Request, user=Depends(get_current_user)):
    db: AsyncIOMotorDatabase = request.app.state.db
    res = await db.client_references.delete_one(
        {"id": ref_id, "project_id": project_id, "user_id": user["user_id"]},
    )
    if res.deleted_count == 0:
        raise HTTPException(404, "Referência não encontrada")
    return {"ok": True, "deleted": ref_id}
