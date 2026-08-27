"""Voice module — Whisper (STT) + LLM (structured extraction) to auto-fill wall fields.

Flow:
1. Frontend records audio (webm/opus from MediaRecorder API) and POSTs multipart.
2. Backend transcribes with Whisper (language='pt').
3. Backend asks an LLM (GPT-5.4 by default) to extract structured wall JSON in cm.
4. Return {transcription, parsed} — frontend merges into the wall form.
"""
from __future__ import annotations

import asyncio
import os
import json
import io
import re
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from emergentintegrations.llm.openai import OpenAISpeechToText
from emergentintegrations.llm.chat import LlmChat, UserMessage

from auth import get_current_user

router = APIRouter(prefix="/api/voice", tags=["voice"])

VOICE_LLM_MODEL = os.environ.get("VOICE_LLM_MODEL", "gpt-5.4")
VOICE_TIMEOUT_S = 60

EXTRACTION_SYSTEM = """Você é um assistente que extrai medidas de ambientes descritas por voz em português brasileiro (marceneiros e arquitetos em obra).

Regras:
- Todos os valores em CENTÍMETROS (converta metros para cm: "2 metros e 80" → 280; "1,5m" → 150; "4,20" (se contexto for metros) → 420).
- Retorne APENAS os campos que o usuário mencionou. Deixe null ou array vazio para não mencionados.
- Nunca invente valores.
- Se houver correção ("não, na verdade 90"), use o VALOR MAIS RECENTE.
- Lado das instalações: "direita"/"lado direito" → "direito"; "esquerda"/"lado esquerdo" → "esquerdo". Se não mencionado, use "direito".
- Estruture as instalações em arrays separados por tipo.

Campos disponíveis:
- altura_pe_direito (float, cm) — pé direito
- largura_total (float, cm) — largura da parede
- altura_rodape, espessura_rodape (float, cm)
- colunas: [{largura, profundidade}] (cm)
- vigas: [{altura, largura}] (cm)
- portas: [{largura_vao, altura_vao, largura_vista, espessura_vista}] (cm; default vista 5 e 1.5 se não dito)
- janelas: [{largura_vista, largura_vao, altura_vao}] (cm; default vista 5)
- tomadas, interruptores, saidas_agua, saidas_esgoto, saidas_gas, registros_agua:
    [{distancia_centro, lado, altura_piso}] (cm)

Responda APENAS com JSON válido, sem comentários e sem markdown."""


NUMBER_EXTRACTION_SYSTEM = """Você extrai UM ÚNICO número (medida em centímetros ou graus) de uma frase falada em português brasileiro.

Regras:
- Interprete metros como cm: "dois metros e sessenta" → 260; "um e cinquenta" → 150; "quatro vinte" (contexto metros) → 420; "80 centímetros" → 80.
- Para ângulos ("graus"), retorne o valor inteiro sem conversão.
- Se houver correção, use o VALOR MAIS RECENTE ("noventa, quer dizer, cem" → 100).
- Se não conseguir extrair um número claro, retorne null.

Responda APENAS com JSON no formato: {"value": <número ou null>}. Sem markdown, sem comentários."""


def _clean_json_response(txt: str) -> str:
    """Strip markdown code fences if the model wrapped the JSON."""
    txt = txt.strip()
    if txt.startswith("```"):
        txt = re.sub(r"^```(?:json)?\s*", "", txt)
        txt = re.sub(r"\s*```\s*$", "", txt)
    return txt.strip()


def _sanitize_parsed(parsed: dict) -> dict:
    """Keep only allowed keys with basic type checks."""
    allowed_scalars = {
        "altura_pe_direito", "largura_total", "altura_rodape", "espessura_rodape",
    }
    allowed_arrays = {
        "colunas", "vigas", "portas", "janelas",
        "tomadas", "interruptores", "saidas_agua", "saidas_esgoto",
        "saidas_gas", "registros_agua",
    }
    out = {}
    for k in allowed_scalars:
        v = parsed.get(k)
        if isinstance(v, (int, float)) and v > 0:
            out[k] = float(v)
    for k in allowed_arrays:
        v = parsed.get(k)
        if isinstance(v, list) and v:
            out[k] = v
    return out


@router.post("/parse")
async def parse_voice(
    request: Request,
    audio: UploadFile = File(...),
    user=Depends(get_current_user),
):
    """Transcribe + extract wall fields from an audio recording."""
    api_key = os.environ["EMERGENT_LLM_KEY"]
    audio_bytes = await audio.read()

    # Whisper wants a file-like object with a name so it detects the format
    ext = ".webm"
    ct = (audio.content_type or "").lower()
    if "wav" in ct:
        ext = ".wav"
    elif "mp3" in ct or "mpeg" in ct:
        ext = ".mp3"
    elif "m4a" in ct or "mp4" in ct:
        ext = ".m4a"

    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = f"voice{ext}"

    # 25MB guard AFTER read (audio.size may be None on streaming)
    if len(audio_bytes) > 25 * 1024 * 1024:
        raise HTTPException(400, "Áudio maior que 25 MB. Grave trechos menores.")

    # 1. Transcribe with Whisper (with hard timeout)
    try:
        stt = OpenAISpeechToText(api_key=api_key)
        result = await asyncio.wait_for(
            stt.transcribe(
                file=audio_file,
                model="whisper-1",
                language="pt",
                response_format="json",
                prompt=(
                    "Marceneiro descrevendo medidas de parede em centímetros e metros: "
                    "pé direito, largura, colunas, vigas, portas, janelas, tomadas, "
                    "interruptores, saídas de água, esgoto, gás, registros."
                ),
                temperature=0.0,
            ),
            timeout=VOICE_TIMEOUT_S,
        )
        transcription = getattr(result, "text", "") or ""
    except asyncio.TimeoutError:
        raise HTTPException(504, "Transcrição demorou demais. Tente um áudio menor.")
    except Exception as e:
        raise HTTPException(500, f"Falha na transcrição: {e}")

    if not transcription.strip():
        return {"transcription": "", "parsed": {}, "warning": "Nenhum áudio reconhecido."}

    # 2. Extract structured JSON via LLM (per-request session to avoid history bloat)
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"voice-{user['user_id']}-{uuid.uuid4().hex[:8]}",
            system_message=EXTRACTION_SYSTEM,
        ).with_model("openai", VOICE_LLM_MODEL)

        user_msg = f"Transcrição:\n\"{transcription}\"\n\nRetorne o JSON."

        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=user_msg)),
            timeout=VOICE_TIMEOUT_S,
        )
        raw = _clean_json_response(response if isinstance(response, str) else str(response))
        parsed = json.loads(raw)
        parsed = _sanitize_parsed(parsed)
    except asyncio.TimeoutError:
        raise HTTPException(504, "Extração demorou demais. Tente novamente.")
    except json.JSONDecodeError as e:
        raise HTTPException(500, f"Resposta da IA não foi JSON válido: {e}")
    except Exception as e:
        raise HTTPException(500, f"Falha na extração: {e}")

    return {
        "transcription": transcription,
        "parsed": parsed,
        "fields_captured": len(parsed),
    }


@router.post("/parse-number")
async def parse_number(
    request: Request,
    audio: UploadFile = File(...),
    context: Optional[str] = Form(None),
    user=Depends(get_current_user),
):
    """Transcribe a short recording and return a SINGLE numeric value.
    Used by the per-field mic button so the user can fill one measurement at a time.
    """
    api_key = os.environ["EMERGENT_LLM_KEY"]
    audio_bytes = await audio.read()
    if len(audio_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "Áudio muito longo. Fale só a medida do campo.")
    ext = ".webm"
    ct = (audio.content_type or "").lower()
    if "wav" in ct:
        ext = ".wav"
    elif "mp3" in ct or "mpeg" in ct:
        ext = ".mp3"
    elif "m4a" in ct or "mp4" in ct:
        ext = ".m4a"
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = f"voice{ext}"

    # 1. Transcribe
    try:
        stt = OpenAISpeechToText(api_key=api_key)
        result = await asyncio.wait_for(
            stt.transcribe(
                file=audio_file,
                model="whisper-1",
                language="pt",
                response_format="json",
                prompt=(
                    "Marceneiro ditando UMA medida em centímetros, metros ou graus: "
                    "\"dois metros e sessenta\", \"80\", \"cento e vinte centímetros\", \"45 graus\"."
                ),
                temperature=0.0,
            ),
            timeout=30,
        )
        transcription = getattr(result, "text", "") or ""
    except asyncio.TimeoutError:
        raise HTTPException(504, "Transcrição demorou demais.")
    except Exception as e:
        raise HTTPException(500, f"Falha na transcrição: {e}")

    if not transcription.strip():
        return {"transcription": "", "value": None}

    # 2. Extract single number
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"vnum-{user['user_id']}-{uuid.uuid4().hex[:8]}",
            system_message=NUMBER_EXTRACTION_SYSTEM,
        ).with_model("openai", VOICE_LLM_MODEL)
        ctx_line = f"Contexto do campo: {context}\n" if context else ""
        user_msg = f"{ctx_line}Transcrição:\n\"{transcription}\"\n\nRetorne o JSON com o único número."
        response = await asyncio.wait_for(
            chat.send_message(UserMessage(text=user_msg)),
            timeout=30,
        )
        raw = _clean_json_response(response if isinstance(response, str) else str(response))
        parsed = json.loads(raw)
        value = parsed.get("value")
        if value is not None:
            try:
                value = float(value)
                if value <= 0 or value > 100000:
                    value = None
            except (ValueError, TypeError):
                value = None
    except asyncio.TimeoutError:
        raise HTTPException(504, "Extração demorou demais.")
    except (json.JSONDecodeError, Exception) as e:
        raise HTTPException(500, f"Falha na extração: {e}")

    return {"transcription": transcription, "value": value}
