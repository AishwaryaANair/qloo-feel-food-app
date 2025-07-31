
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.moods import MoodInput, UserPreferences
from services.places_services import PlacesServices
from services.qloo_services import QlooService
from services.gemini_services import GeminiService

router = APIRouter()

@router.post("/get-recommendations")
async def get_recommendations(
    mood_input: MoodInput,
    user_preferences: Optional[UserPreferences] = None,
    location: Optional[str] = Query("San Francisco, CA", description="User's current location")
):
    """
    Get comprehensive recommendations including places, music, and activities
    based on mood, user preferences, and location.
    """
    try:
        # Initialize services
        qloo = QlooService()
        gemini = GeminiService()
        places = PlacesServices()

        # 1. Get taste profile from Qloo
        taste_profile = await qloo.get_taste_profile(
            user_preferences.dict() if user_preferences else {}
        )

        # 2. Get mood-based correlations from Qloo
        mood_correlations = await qloo.get_mood_correlations(
            mood_input.primary_mood.value,
            taste_profile
        )

        # 3. Get places recommendations
        recommended_places = await places.search_places(
            mood_correlations,
            mood_input.model_dump(),
            location
        )

        if not recommended_places:
            raise HTTPException(
                status_code=404,
                detail="Could not find any matching places for your mood right now. Try being a little more descriptive!"
            )

        # 4. Get music recommendations
        music_recommendations = await qloo.get_music_recommendations(
            mood_input.primary_mood.value,
            taste_profile
        )

        # 5. Get activity recommendations
        activity_recommendations = await qloo.get_activity_recommendations(
            mood_input.primary_mood.value,
            taste_profile
        )

        # 6. Enhance place data with Gemini's emotionally resonant descriptions
        for place in recommended_places:
            place['emotional_description'] = await gemini.generate_place_description(
                place,
                mood_input.primary_mood.value,
                taste_profile
            )

        # 7. Get cross-domain recommendations for the first place
        cross_domain_recs = {}
        if recommended_places:
            cross_domain_recs = await qloo.get_cross_domain_recommendations(
                recommended_places[0],
                ["music", "activities"]
            )

        # 8. Generate final insights from Gemini
        final_insight = await gemini.generate_emotional_insight(
            mood_input.dict(),
            recommended_places[0] if recommended_places else None
        )

        return {
            "mood_input": mood_input,
            "location": location,
            "recommendations": {
                "places": recommended_places,
                "music": music_recommendations,
                "activities": activity_recommendations,
                "cross_domain": cross_domain_recs
            },
            "mood_insights": final_insight,
            "qloo_correlations": mood_correlations,
            "taste_profile": taste_profile
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred in get_recommendations: {e}")
        raise HTTPException(
            status_code=500,
            detail="We're having trouble finding recommendations right now. Please try again in a moment."
        )

@router.post("/get-music-for-place")
async def get_music_for_place(
    place_data: dict,
    mood: str,
    user_preferences: Optional[UserPreferences] = None
):
    """
    Get music recommendations specifically tailored for a given place.
    """
    try:
        qloo = QlooService()

        taste_profile = await qloo.get_taste_profile(
            user_preferences.dict() if user_preferences else {}
        )

        # Get cross-domain music recommendations for this specific place
        cross_domain_recs = await qloo.get_cross_domain_recommendations(
            place_data,
            ["music"]
        )

        # Also get general mood-based music
        mood_music = await qloo.get_music_recommendations(mood, taste_profile)

        return {
            "place_specific_music": cross_domain_recs.get("music", []),
            "mood_music": mood_music,
            "place": place_data["name"]
        }

    except Exception as e:
        print(f"Error getting music for place: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get music recommendations for this place"
        )

@router.post("/get-activities-for-mood")
async def get_activities_for_mood(
    mood: str,
    location: str = "San Francisco, CA",
    user_preferences: Optional[UserPreferences] = None
):
    """
    Get activity recommendations based on current mood and location.
    """
    try:
        qloo = QlooService()

        taste_profile = await qloo.get_taste_profile(
            user_preferences.dict() if user_preferences else {}
        )

        activities = await qloo.get_activity_recommendations(mood, taste_profile)

        return {
            "mood": mood,
            "location": location,
            "activities": activities,
            "total_activities": len(activities)
        }

    except Exception as e:
        print(f"Error getting activities: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get activity recommendations"
        )

@router.get("/correlations/{mood}")
async def get_mood_correlations_endpoint(mood: str):
    """
    Get detailed mood correlations for debugging or advanced users.
    """
    try:
        qloo = QlooService()

        # Get a basic taste profile
        taste_profile = await qloo.get_taste_profile({})

        correlations = await qloo.get_mood_correlations(mood, taste_profile)

        return {
            "mood": mood,
            "correlations": correlations,
            "taste_profile": taste_profile
        }

    except Exception as e:
        print(f"Error getting correlations: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get mood correlations"
        )
