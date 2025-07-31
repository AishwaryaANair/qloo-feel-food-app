from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.moods import MoodInput, UserPreferences
from services.qloo_services import QlooService
from services.gemini_services import GeminiService
from services.places_services import PlacesService

router = APIRouter()

@router.post("/get-recommendations")
async def get_recommendations(
    mood_input: MoodInput,
    user_preferences: Optional[UserPreferences] = None,
    location: Optional[str] = Query("San Francisco, CA", description="User's current location, e.g., 'City, ST'")
):
    """
    Get food and place recommendations based on mood, user preferences, and location.
    This endpoint orchestrates calls to Qloo, a Places service, and Gemini.
    """
    try:
        # Initialize services
        qloo = QlooService()
        gemini = GeminiService()
        places = PlacesService()

        # 1. Get taste profile from Qloo (or use a mock profile)
        taste_profile = await qloo.get_taste_profile(user_preferences.dict() if user_preferences else {})

        # 2. Get mood-based correlations from Qloo using the mood and taste profile
        mood_correlations = await qloo.get_mood_correlations(
            mood_input.primary_mood.value,
            taste_profile
        )

        # 3. Get actual places from a Places service using the correlations and location
        recommended_places = await places.search_places(
            mood_correlations,
            mood_input.model_dump(),

        )

        if not recommended_places:
            raise HTTPException(status_code=404, detail="Could not find any matching places for your mood right now. Try being a little more descriptive!")

        # 4. Enhance place data with Gemini's emotionally resonant descriptions
        for place in recommended_places:
            place['emotional_description'] = await gemini.generate_place_description(
                place,
                mood_input.primary_mood.value,
                taste_profile
            )

        # 5. Generate a final insight from Gemini
        final_insight = await gemini.generate_emotional_insight(mood_input.dict(), recommended_places[0])

        return {
            "mood_input": mood_input,
            "location": location,
            "recommendations": recommended_places,
            "mood_insights": final_insight,
            "qloo_correlations": mood_correlations
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred in get_recommendations: {e}")
        # Provide a more user-friendly error message
        raise HTTPException(status_code=500, detail="We're having trouble finding recommendations right now. Please try again in a moment.")
