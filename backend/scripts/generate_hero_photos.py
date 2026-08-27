"""Generate hero landing photos using Nano Banana (gemini-3.1-flash-image-preview).

Two photos are generated for the marketing landing:
  1. Arquiteta (female architect) using iPhone in a modern, well-lit apartment
  2. Marceneiro (male craftsman) in a penthouse loft using the app on his phone

Both must feel human, warm and aspirational (light, joyful atmosphere).
"""
import asyncio
import base64
import os
from pathlib import Path

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

BASE = Path(__file__).resolve().parent.parent.parent  # /app/backend/scripts/x.py -> /app
OUT_DIR = BASE / "frontend" / "public" / "hero"
OUT_DIR.mkdir(parents=True, exist_ok=True)

load_dotenv(BASE / "backend" / ".env")
API_KEY = os.environ["EMERGENT_LLM_KEY"].strip('"').strip("'")

PROMPTS = [
    (
        "arquiteta.png",
        "Photorealistic portrait, warm cinematic light. A young Brazilian female architect "
        "in her early 30s, natural beauty, subtle smile, wearing a light beige linen blazer, "
        "holding a modern iPhone in one hand, standing in a bright open loft with floor-to-ceiling "
        "windows, plants and a marble kitchen island in the background. On the iPhone screen "
        "there is a construction measurement app UI with a dark theme and gold accents — barely "
        "visible, just enough to feel real. Soft morning sunlight, shallow depth of field, "
        "editorial lifestyle photography, high dynamic range. Aspect ratio 3:4 vertical portrait."
    ),
    (
        "marceneiro.png",
        "Photorealistic portrait, warm golden hour light. A friendly Brazilian male craftsman "
        "(marceneiro) in his early 40s, short salt-and-pepper beard, wearing a rolled-up denim "
        "shirt and a leather apron. He is standing inside a luxury penthouse apartment under "
        "renovation, holding a smartphone at eye level, looking at the screen with a soft smile. "
        "The apartment has raw concrete walls, exposed wooden beams and floor-to-ceiling windows "
        "with a city skyline view behind him. Wood planks, a tape measure and a wooden pencil "
        "are on a nearby sawhorse. Cinematic warm sunlight, shallow depth of field, editorial "
        "lifestyle photography, ultra-detailed. Aspect ratio 3:4 vertical portrait."
    ),
]


async def gen(name: str, prompt: str) -> Path:
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"tmf-hero-{name}",
        system_message="You generate premium editorial lifestyle photographs.",
    )
    chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(
        modalities=["image", "text"]
    )

    msg = UserMessage(text=prompt)
    text, images = await chat.send_message_multimodal_response(msg)

    if not images:
        raise RuntimeError(f"No image returned for {name}: {text[:200] if text else 'empty'}")

    out = OUT_DIR / name
    out.write_bytes(base64.b64decode(images[0]["data"]))
    return out


async def main():
    for name, prompt in PROMPTS:
        try:
            path = await gen(name, prompt)
            print(f"OK {name} -> {path} ({path.stat().st_size // 1024} KB)")
        except Exception as e:
            print(f"FAIL {name}: {e}")


if __name__ == "__main__":
    asyncio.run(main())
