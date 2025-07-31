from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from services.places_services import PlacesServices

router = APIRouter()

@router.get("/heatmap")
async def get_vibe_heatmap(
    location: str = Query("San Francisco, CA", description="Location to get heatmap data for"),
    radius: int = Query(10000, description="Search radius in meters")
):
    """
    Get places data for vibe heatmap visualization.
    Returns places with emotion intensity data for mapping.
    """
    try:
        places_service = PlacesServices()
        heatmap_data = await places_service.get_vibe_heatmap_data(location, radius)

        if not heatmap_data:
            raise HTTPException(
                status_code=404,
                detail="No places found for heatmap in the specified location"
            )

        return {
            "location": location,
            "radius": radius,
            "places": heatmap_data,
            "total_places": len(heatmap_data)
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error generating heatmap data: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to generate heatmap data"
        )

@router.get("/place/{place_id}/emotions")
async def get_place_emotions(place_id: str):
    """
    Get detailed emotion data for a specific place.
    """
    try:
        places_service = PlacesServices()

        # In a real implementation, this would fetch from a database
        # For now, we'll simulate the data
        emotions = {
            "happy": 0.7,
            "relaxed": 0.6,
            "energetic": 0.4,
            "nostalgic": 0.3,
            "contemplative": 0.5,
            "romantic": 0.8,
            "anxious": 0.2,
            "lonely": 0.1
        }

        return {
            "place_id": place_id,
            "emotions": emotions,
            "dominant_emotion": max(emotions.items(), key=lambda x: x[1])[0],
            "last_updated": "2024-01-01T12:00:00Z"
        }

    except Exception as e:
        print(f"Error getting place emotions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get place emotion data"
        )
