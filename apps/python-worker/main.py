"""
ABCD Social Hub — Heavy Media Processing Worker (FastAPI)
Handles Bengali & Regional Poster rendering, Edge-TTS Free Neural Voice Synthesis,
Anti-AI Slop Humanizing, and Media Normalization.
"""

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load root and local .env files
load_dotenv("../../.env")
load_dotenv(".env")

app = FastAPI(
    title="ABCD Social Media Worker",
    version="1.0.0",
    docs_url="/docs" if os.getenv("NODE_ENV") != "production" else None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET", "default_secret")

def verify_internal_secret(x_internal_secret: Optional[str] = Header(None)):
    if os.getenv("NODE_ENV") == "production" and x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized internal worker call")
    return True

class HealthResponse(BaseModel):
    status: str
    service: str
    indic_fonts_loaded: bool
    voice_synthesis: bool

class PosterRenderRequest(BaseModel):
    headline: str
    subheadline: Optional[str] = None
    discount_tag: Optional[str] = None
    business_name: str
    phone_number: str
    address: str
    language: str = "bengali"  # "bengali" | "english"
    template_id: str = "festive-banner-v1"
    brand_primary_color: str = "#00F0FF"
    logo_url: Optional[str] = None

class HumanizeRequest(BaseModel):
    text: str
    language: str = "english"
    business_context: Optional[str] = None

class VoiceoverRequest(BaseModel):
    text: str
    language: str = "bengali"  # "bengali" | "english"
    gender: str = "female"      # "female" | "male"
    voice_override: Optional[str] = None

@app.get("/health", response_model=HealthResponse)
def health_check():
    fonts_dir = os.path.join(os.path.dirname(__file__), "fonts")
    has_fonts = os.path.exists(os.path.join(fonts_dir, "NotoSansBengali.ttf"))
    return {
        "status": "healthy",
        "service": "abcd-python-worker",
        "indic_fonts_loaded": has_fonts,
        "voice_synthesis": True
    }

@app.post("/api/render-poster", dependencies=[Depends(verify_internal_secret)])
async def render_poster(payload: PosterRenderRequest):
    """
    Renders 1080x1080 promotional poster with Bengali/Indic fonts and uploads to Cloudinary CDN.
    """
    from tasks.poster_render import generate_poster_image
    result = await generate_poster_image(payload)
    return result

@app.post("/api/generate-voiceover", dependencies=[Depends(verify_internal_secret)])
async def generate_voiceover(payload: VoiceoverRequest):
    """
    Generates ultra-natural zero-cost Bengali/Indian English MP3 voiceover via Edge-TTS
    and uploads to Cloudinary media storage.
    """
    from tasks.voice_tts import generate_voiceover_audio
    result = await generate_voiceover_audio(
        text=payload.text,
        language=payload.language,
        gender=payload.gender,
        voice_override=payload.voice_override
    )
    return result

@app.post("/api/humanize", dependencies=[Depends(verify_internal_secret)])
async def humanize_copy(payload: HumanizeRequest):
    """
    Scrubs AI buzzwords using Turnitout rules and enhances sentence cadence.
    """
    from tasks.humanizer import scrub_ai_slop
    result = scrub_ai_slop(payload.text, payload.language, payload.business_context)
    return {"cleaned_text": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
