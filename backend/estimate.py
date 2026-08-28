"""Módulo do Estimador Rápido de Orçamento.

Objetivo: dar ao Marcos (ou ao cliente) uma faixa de preço estimada em segundos,
para peças simples de marcenaria, antes do projeto completo.

Fórmula base:
    material    = area_m2 * mdf_rate * module_complexity + fixed_hardware
    labor       = material * labor_multiplier   (Marcos cobra 1x o material)
    total       = material + labor
    min = total * 0.90 (folga para negociação)
    max = total * 1.20 (imprevistos)
"""
from typing import Literal, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from auth import get_current_user

router = APIRouter(prefix="/estimate", tags=["estimate"])


# ---- Catálogo de MDF (R$ por m² · valores médios Brasil 2026) ----
MDF_RATES = {
    "basico":  {"label": "Básico (cor lisa, 15mm)",       "rate": 180},
    "medio":   {"label": "Médio (cor tendência, 18mm)",   "rate": 280},
    "premium": {"label": "Premium (texturizado, 18mm)",   "rate": 420},
}

# ---- Módulos e sua complexidade ----
# base_multiplier = fator sobre a área em m²
# fixed_hw       = valor fixo de ferragens em reais
# needs_dimensions = quais medidas o front deve pedir
MODULES = {
    "prateleira": {
        "label": "Prateleira",
        "base_multiplier": 1.0,
        "fixed_hw": 30,
        "needs": ["largura", "profundidade"],
        "descricao": "1 tampo horizontal com apoios",
    },
    "mesa": {
        "label": "Mesa / Escrivaninha",
        "base_multiplier": 1.3,
        "fixed_hw": 120,
        "needs": ["largura", "profundidade", "altura"],
        "descricao": "Tampo + pés / estrutura",
    },
    "balcao_aberto": {
        "label": "Balcão sem portas",
        "base_multiplier": 1.4,
        "fixed_hw": 150,
        "needs": ["largura", "profundidade", "altura"],
        "descricao": "Caixa com nichos abertos",
    },
    "balcao_portas_correr": {
        "label": "Balcão com portas de correr",
        "base_multiplier": 1.9,
        "fixed_hw": 320,
        "needs": ["largura", "profundidade", "altura"],
        "descricao": "Caixa + trilhos + portas deslizantes",
    },
    "armario_completo": {
        "label": "Armário completo (portas + gavetas)",
        "base_multiplier": 2.6,
        "fixed_hw": 480,
        "needs": ["largura", "profundidade", "altura"],
        "descricao": "Caixa + portas com dobradiças + gavetas com corrediças",
    },
    "painel_ripado": {
        "label": "Painel ripado (parede decorativa)",
        "base_multiplier": 1.6,
        "fixed_hw": 60,
        "needs": ["largura", "altura"],
        "descricao": "Ripas verticais fixadas à parede",
    },
}

LABOR_MULTIPLIER = 1.0  # Marcos cobra 1x o material como mão de obra


class EstimateRequest(BaseModel):
    module: Literal[
        "prateleira",
        "mesa",
        "balcao_aberto",
        "balcao_portas_correr",
        "armario_completo",
        "painel_ripado",
    ]
    mdf_tier: Literal["basico", "medio", "premium"] = "medio"
    # dimensões em centímetros
    largura: float = Field(ge=10, le=800)
    altura: Optional[float] = Field(default=None, ge=10, le=400)
    profundidade: Optional[float] = Field(default=None, ge=10, le=200)
    qty: int = Field(default=1, ge=1, le=20)
    cliente_nome: Optional[str] = None


def _brl(v: float) -> str:
    return f"R$ {v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


@router.get("/catalog")
async def catalog():
    """Devolve o catálogo de módulos e MDFs para o front construir o formulário."""
    return {
        "modules": [{"id": k, **v} for k, v in MODULES.items()],
        "mdf_tiers": [{"id": k, **v} for k, v in MDF_RATES.items()],
    }


@router.post("")
async def estimate(req: EstimateRequest, user=Depends(get_current_user)):
    mod = MODULES[req.module]
    mdf = MDF_RATES[req.mdf_tier]

    # Face principal em m² — depende do módulo
    if req.module == "painel_ripado":
        if not req.altura:
            raise HTTPException(400, "Painel ripado precisa de altura")
        area = (req.largura / 100.0) * (req.altura / 100.0)
    elif req.module == "prateleira":
        if not req.profundidade:
            raise HTTPException(400, "Prateleira precisa de profundidade")
        area = (req.largura / 100.0) * (req.profundidade / 100.0)
    else:
        if not (req.altura and req.profundidade):
            raise HTTPException(400, "Este módulo precisa de largura, altura e profundidade")
        # área desdobrada aproximada: face frontal + duas laterais + tampo/fundo
        w = req.largura / 100.0
        h = req.altura / 100.0
        d = req.profundidade / 100.0
        area = (w * h) + 2 * (h * d) + (w * d)  # 4 faces principais

    material = (area * mdf["rate"] * mod["base_multiplier"] + mod["fixed_hw"]) * req.qty
    labor = material * LABOR_MULTIPLIER
    total = material + labor
    min_v = round(total * 0.90, 2)
    avg_v = round(total, 2)
    max_v = round(total * 1.20, 2)

    dims = f"{req.largura:g}cm"
    if req.altura:
        dims += f" × {req.altura:g}cm"
    if req.profundidade:
        dims += f" × {req.profundidade:g}cm"

    qty_txt = f"{req.qty}× " if req.qty > 1 else ""
    cliente_saudacao = f"Olá {req.cliente_nome.strip()}, " if req.cliente_nome else "Olá! "

    whatsapp_text = (
        f"{cliente_saudacao}segue estimativa para {qty_txt}{mod['label'].lower()} "
        f"({dims}) em MDF {mdf['label'].split(' ')[0].lower()}:\n\n"
        f"💰 *Faixa estimada:* {_brl(min_v)} a {_brl(max_v)}\n"
        f"📐 Valor médio: *{_brl(avg_v)}*\n\n"
        f"Esse é o valor bruto para eu já te dar uma ideia rápida.\n"
        f"Se fizer sentido para ti, a gente marca uma visita para eu tirar as medidas exatas "
        f"com a trena a laser e fazer o projeto detalhado (sem custo se fecharmos).\n\n"
        f"Fico no aguardo! · Marcos"
    )

    return {
        "min": min_v,
        "avg": avg_v,
        "max": max_v,
        "area_m2": round(area, 3),
        "material": round(material, 2),
        "labor": round(labor, 2),
        "module_label": mod["label"],
        "mdf_label": mdf["label"],
        "whatsapp_text": whatsapp_text,
    }
