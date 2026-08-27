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
        "marceneiro.png",
        "Photorealistic editorial photograph shot from a HIGH ANGLE — camera positioned about "
        "45 degrees above and slightly behind the subject's LEFT SHOULDER, looking down at the "
        "phone in his hands. A friendly Brazilian male craftsman (marceneiro) in his early 40s, "
        "short salt-and-pepper beard, wearing a rolled-up denim shirt and a leather apron. He is "
        "standing on the terrace of a luxury penthouse under renovation, holding a common modern "
        "ANDROID smartphone (Samsung Galaxy style, NOT an iPhone — no Apple logo, no rounded "
        "iPhone silhouette) in both hands, focused on the app on the screen. On the phone screen "
        "there is a construction measurement app UI with a dark theme and gold accents — barely "
        "visible, just enough to feel real. \n\n"
        "In the BACKGROUND, well visible from the high angle over his shoulder, we see the wide "
        "open penthouse view: a beautiful Brazilian coastal city spread out below with white "
        "buildings, and beyond the city a curved beach shoreline meeting the turquoise sea, on a "
        "vibrant sunny summer day with a clear blue sky and a few soft clouds. On the terrace: "
        "raw concrete floor, a wooden sawhorse with fresh planks, a yellow tape measure and a "
        "pencil resting on the wood. Warm golden late-morning sunlight, cinematic depth of field "
        "with the phone/hands in sharp focus and the city/beach softly blurred. Editorial "
        "lifestyle photography. Aspect ratio 3:4 vertical portrait, ultra-detailed."
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
