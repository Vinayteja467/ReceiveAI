from app.core.config import settings
from app.services.ai_engine.base import BaseReceivingVisionEngine
from app.services.ai_engine.demo_engine import DeterministicDemoEngine
from app.services.ai_engine.gemini_engine import GeminiVisionEngine

def get_vision_engine() -> BaseReceivingVisionEngine:
    api_key = (os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY or "").strip()

    if api_key and not api_key.startswith("your_"):
        return GeminiVisionEngine(api_key=api_key)

    # Transparently return deterministic demo engine when no key is set
    return DeterministicDemoEngine()
