"""AI Vision — analyze a wall photo and identify architectural elements.
Uses Gemini 3.1 Pro (best-in-class spatial reasoning) via Emergent LLM key.
Returns structured JSON with counts + rough position hints.
"""
from __future__ import annotations

import os
import json
import base64
import re
import uuid
import asyncio
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

from auth import get_current_user

router = APIRouter(prefix="/api/vision", tags=["vision"])

VISION_MODEL = os.environ.get("VISION_MODEL", "gemini-3.1-pro-preview")
VISION_TIMEOUT_S = 60

VISION_SYSTEM = """Você é um assistente de visão computacional especializado em análise de fotos de PAREDES INTERNAS para arquitetos, projetistas e marceneiros.

Sua tarefa: identificar TODOS os elementos arquitetônicos visíveis na foto de uma parede e retornar contagens estruturadas.

Elementos a identificar:
- portas (contar quantas, medir proporção largura/altura visual)
- janelas (contar, medir proporção)
- tomadas elétricas (contar, indicar lado aproximado)
- interruptores de luz (contar, indicar lado)
- saidas_agua (torneiras, saídas de chuveiro, entradas)
- saidas_esgoto (ralos, tubos)
- saidas_gas (registros de gás)
- registros_agua (registros/válvulas de água)
- colunas (pilares visíveis)
- vigas (vigas horizontais no topo)

Para cada elemento IDENTIFICADO, forneça:
- position: "esquerdo" | "centro" | "direito"  (posição estimada horizontal)
- altura_relativa: "baixo" | "meio" | "alto"  (posição vertical relativa ao pé direito)
- confianca: 0.0-1.0  (quão certo você está)

Se a foto não parecer uma parede interna válida ou estiver muito escura/borrada, retorne:
{"valid": false, "reason": "..."}

Caso contrário, retorne:
{
  "valid": true,
  "descricao": "descrição curta em 1 frase do que você vê",
  "elementos": {
    "portas": [{"position": "...", "altura_relativa": "...", "confianca": 0.9}],
    "janelas": [...],
    "tomadas": [...],
    "interruptores": [...],
    "saidas_agua": [...],
    "saidas_esgoto": [...],
    "saidas_gas": [...],
    "registros_agua": [...],
    "colunas": [...],
    "vigas": [...]
  },
  "cor_predominante_hex": "#RRGGBB",
  "observacoes": "quaisquer observações relevantes"
}

Retorne APENAS JSON válido, sem comentários e sem markdown."""


def _clean_json_response(txt: str) -> str:
    txt = txt.strip()
    if txt.startswith("```"):
        txt = re.sub(r"^```(?:json)?\s*", "", txt)
        txt = re.sub(r"\s*```\s*$", "", txt)
    return txt.strip()


ELEMENT_TO_WALL_FIELD = {
    "portas": ("portas", lambda e: {"largura_vao": 80, "altura_vao": 210, "largura_vista": 5, "espessura_vista": 1.5}),
    "janelas": ("janelas", lambda e: {"largura_vista": 5, "largura_vao": 120, "altura_vao": 100}),
    "tomadas": ("tomadas", lambda e: _ponto_from_element(e, default_altura=30)),
    "interruptores": ("interruptores", lambda e: _ponto_from_element(e, default_altura=110)),
    "saidas_agua": ("saidas_agua", lambda e: _ponto_from_element(e, default_altura=90)),
    "saidas_esgoto": ("saidas_esgoto", lambda e: _ponto_from_element(e, default_altura=20)),
    "saidas_gas": ("saidas_gas", lambda e: _ponto_from_element(e, default_altura=40)),
    "registros_agua": ("registros_agua", lambda e: _ponto_from_element(e, default_altura=120)),
    "colunas": ("colunas", lambda e: {"largura": 15, "profundidade": 15}),
    "vigas": ("vigas", lambda e: {"altura": 20, "largura": 15}),
}


def _ponto_from_element(e: dict, default_altura: float) -> dict:
    pos = e.get("position", "centro")
    lado = "direito" if pos in ("direito", "centro") else "esquerdo"
    altura_map = {"baixo": 20, "meio": 100, "alto": 200}
    altura = altura_map.get(e.get("altura_relativa", "meio"), default_altura)
    return {"distancia_centro": 50, "lado": lado, "altura_piso": altura}


def _to_wall_prefill(analysis: dict) -> dict:
    """Convert Gemini analysis into a partial wall dict the frontend can merge."""
    if not analysis.get("valid"):
        return {}
    elementos = analysis.get("elementos", {}) or {}
    out = {}
    for key, items in elementos.items():
        if not items or key not in ELEMENT_TO_WALL_FIELD:
            continue
        target_key, factory = ELEMENT_TO_WALL_FIELD[key]
        # keep only reasonably-confident items
        confident = [e for e in items if float(e.get("confianca", 1.0)) >= 0.5]
        out[target_key] = [factory(e) for e in confident]
    return {k: v for k, v in out.items() if v}


@router.post("/analyze")
async def analyze_wall_photo(
    request: Request,
    photo: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """Analyze a wall photo. Returns raw analysis + a merge-able partial wall dict."""
    api_key = os.environ["EMERGENT_LLM_KEY"]

    if not (photo.content_type or "").startswith("image/"):
        raise HTTPException(400, "Envie uma imagem (JPG ou PNG).")

    raw = await photo.read()
    if len(raw) > 15 * 1024 * 1024:
        raise HTTPException(400, "Foto maior que 15 MB. Reduza a resolução.")

    b64 = base64.b64encode(raw).decode()

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"vision-{user['user_id']}-{uuid.uuid4().hex[:8]}",
            system_message=VISION_SYSTEM,
        ).with_model("gemini", VISION_MODEL)

        msg = UserMessage(
            text="Analise esta foto de parede e retorne o JSON conforme instruções.",
            file_contents=[ImageContent(image_base64=b64)],
        )

        response = await asyncio.wait_for(
            chat.send_message(msg), timeout=VISION_TIMEOUT_S
        )
        cleaned = _clean_json_response(response if isinstance(response, str) else str(response))
        analysis = json.loads(cleaned)
    except asyncio.TimeoutError:
        raise HTTPException(504, "Análise demorou demais. Tente uma foto menor.")
    except json.JSONDecodeError as e:
        raise HTTPException(500, f"IA retornou resposta inválida: {e}")
    except Exception as e:
        raise HTTPException(500, f"Falha na análise: {e}")

    if not analysis.get("valid"):
        return {
            "valid": False,
            "reason": analysis.get("reason", "Não foi possível analisar a imagem."),
            "prefill": {},
        }

    prefill = _to_wall_prefill(analysis)
    total_elements = sum(
        len(v) for v in analysis.get("elementos", {}).values() if isinstance(v, list)
    )

    return {
        "valid": True,
        "descricao": analysis.get("descricao"),
        "cor_predominante_hex": analysis.get("cor_predominante_hex"),
        "observacoes": analysis.get("observacoes"),
        "elementos_identificados": total_elements,
        "raw": analysis.get("elementos", {}),
        "prefill": prefill,
    }
