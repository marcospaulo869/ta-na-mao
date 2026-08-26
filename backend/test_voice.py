"""Quick sanity check for the voice extraction LLM prompt."""
import asyncio, json, os, sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
sys.path.insert(0, str(Path(__file__).parent))

from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa
from voice import EXTRACTION_SYSTEM, _clean_json_response, _sanitize_parsed  # noqa


async def test():
    api_key = os.environ["EMERGENT_LLM_KEY"]
    chat = LlmChat(
        api_key=api_key,
        session_id="test-voice-1",
        system_message=EXTRACTION_SYSTEM,
    ).with_model("openai", "gpt-5.4")
    transcription = (
        "Pé direito 2 metros e 80. Largura da parede 4 metros e 20. "
        "Tem uma porta de 80 por 210. Tem três tomadas do lado direito, "
        "uma a 30 do piso, outra a 110 e outra a 130, todas a 50 do canto. "
        "Tem um interruptor do lado esquerdo a 110 do chão, distância do centro 20. "
        "Tem uma saída de água do lado esquerdo, distância 80, altura 90. "
        "E uma coluna de 15 por 15."
    )
    resp = await chat.send_message(UserMessage(text=f"Transcrição:\n\"{transcription}\"\n\nRetorne o JSON."))
    raw = _clean_json_response(resp if isinstance(resp, str) else str(resp))
    parsed = json.loads(raw)
    print("RAW:", json.dumps(parsed, ensure_ascii=False, indent=2))
    print("SANITIZED:", json.dumps(_sanitize_parsed(parsed), ensure_ascii=False, indent=2))


asyncio.run(test())
