from fastapi import APIRouter, HTTPException, Query
from services.gemini_services import GeminiService
from typing import Optional

router = APIRouter()

@router.get("/question")
async def get_vibe_question(
    mood: str = Query(..., description="The user's current mood, e.g., 'anxious', 'celebratory'."),
    place_type: Optional[str] = Query("this place", description="The type of place, e.g., 'cafe', 'diner'.")
):
    """
    Generates a random, mood-specific question to ask others about a place's vibe.
    This is used for the "Vibe Check" feature.
    """
    if not mood:
        raise HTTPException(status_code=400, detail="A mood parameter is required.")

    try:
        gemini = GeminiService()
        question = await gemini.generate_vibe_check_question(mood, place_type)
        return {"vibe_question": question}
    except Exception as e:
        print(f"Error generating vibe question: {e}")
        raise HTTPException(status_code=500, detail="Could not generate a vibe question right now.")
