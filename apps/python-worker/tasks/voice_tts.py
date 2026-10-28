"""
Edge-TTS Free Neural Voice Synthesis Module
Zero-cost high-fidelity Bengali and Indian English text-to-speech for social audio/video reels.
"""

import os
import io
import asyncio
from typing import Dict, Any, Optional
import edge_tts
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv("../../.env")
load_dotenv(".env")

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "mdlaprj0"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "237718767231823"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "1qU1sCdgcIeLuEit0WuTuG5T8Z4"),
    secure=True
)

VOICE_MAP = {
    "bengali": {
        "female": "bn-IN-TanishaaNeural",
        "male": "bn-IN-BashkarNeural"
    },
    "english": {
        "female": "en-IN-NeerjaNeural",
        "male": "en-IN-PrabhatNeural"
    }
}

async def generate_voiceover_audio(
    text: str,
    language: str = "bengali",
    gender: str = "female",
    voice_override: Optional[str] = None
) -> Dict[str, Any]:
    """
    Synthesizes neural voiceover MP3 using Microsoft Edge Neural TTS at zero cost,
    then uploads to Cloudinary audio storage.
    """
    lang_key = "bengali" if language.lower() in ["bengali", "bn", "bangla"] else "english"
    gender_key = "male" if gender.lower() == "male" else "female"
    
    voice = voice_override or VOICE_MAP.get(lang_key, {}).get(gender_key, "bn-IN-TanishaaNeural")
    
    # Generate MP3 audio using edge-tts
    communicate = edge_tts.Communicate(text, voice)
    mp3_buffer = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            mp3_buffer.write(chunk["data"])
            
    mp3_buffer.seek(0)
    audio_bytes = mp3_buffer.getvalue()
    
    if len(audio_bytes) == 0:
        raise ValueError("Neural TTS generated 0 bytes of audio")
        
    # Upload to Cloudinary (audio is handled as resource_type='video' in Cloudinary)
    upload_result = cloudinary.uploader.upload(
        io.BytesIO(audio_bytes),
        folder="abcd_voiceovers",
        resource_type="video",
        format="mp3"
    )
    
    secure_url = upload_result.get("secure_url") or upload_result.get("url")
    duration = upload_result.get("duration", 0)
    
    return {
        "status": "success",
        "audio_url": secure_url,
        "voice": voice,
        "language": lang_key,
        "duration_seconds": duration,
        "file_size_bytes": len(audio_bytes)
    }
