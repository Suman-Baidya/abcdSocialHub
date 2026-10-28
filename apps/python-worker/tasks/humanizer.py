"""
Turnitout-Humanizer Module
Deterministically scrubs AI buzzwords and robotic cadences from generated copy.
"""

import re

# Banned LLM buzzwords and robotic transitional phrases
BANNED_LEXICON = [
    r"\bdelve\b",
    r"\btestament\b",
    r"\btapestry\b",
    r"\bbeacon\b",
    r"\bin today's fast-paced digital world\b",
    r"\bin today's digital landscape\b",
    r"\bunlock your potential\b",
    r"\belevate your\b",
    r"\bgame-changer\b",
    r"\brevolutionize\b",
    r"\bseamlessly\b",
    r"\bplethora\b",
    r"\blook no further\b",
    r"\bwithout further ado\b",
    r"\bharness the power of\b"
]

def scrub_ai_slop(text: str, language: str = "english", business_context: str = None) -> str:
    cleaned = text
    for pattern in BANNED_LEXICON:
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)
    
    # Clean up double spaces or awkward punctuation left over
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    cleaned = re.sub(r"\s+([.,!?])", r"\1", cleaned)

    # If business context is provided (e.g. phone/location), ensure it grounds the text
    if business_context and business_context not in cleaned:
        cleaned += f"\n\n📍 {business_context}"
        
    return cleaned
