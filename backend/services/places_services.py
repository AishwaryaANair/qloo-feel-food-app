import os
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
import logging
from services.places_services import PlacesServices

logger = logging.getLogger(__name__)

class PlacesServices:
    """
    Service for interacting with Google Places API to find real places.
    Replaces the mock PlacesService with actual Google Places data.
    """

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_PLACES_API_KEY")
        self.base_url = "https://maps.googleapis.com/maps/api/place"

        if not self.api_key:
            logger.warning("GOOGLE_PLACES_API_KEY not found. Using fallback mock data.")

    async def search_places(
        self,
        mood_correlations: Dict[str, List[str]],
        mood_input: Dict[str, Any],
        location: str = "San Francisco, CA"
    ) -> List[Dict[str, Any]]:
        """
        Search for real places using Google Places API based on mood correlations.
        """
        if not self.api_key:
            return await self._get_fallback_places(mood_correlations, location)

        try:
            # Get coordinates for the location first
            coords = await self._geocode_location(location)
            if not coords:
                logger.error(f"Could not geocode location: {location}")
                return await self._get_fallback_places(mood_correlations, location)

            # Search for places based on mood keywords
            search_keywords = mood_correlations.get("search_keywords", ["restaurant", "cafe"])
            all_places = []

            for keyword in search_keywords[:3]:  # Limit to 3 keywords to avoid rate limits
                places = await self._search_nearby_places(coords, keyword)
                all_places.extend(places)

            # Remove duplicates and limit results
            unique_places = {}
            for place in all_places:
                if place["place_id"] not in unique_places:
                    unique_places[place["place_id"]] = place

            results = list(unique_places.values())[:6]  # Limit to 6 results

            # Enhance with detailed information
            enhanced_places = []
            for place in results:
                enhanced_place = await self._enhance_place_details(place)
                if enhanced_place:
                    enhanced_places.append(enhanced_place)

            return enhanced_places[:4]  # Return top 4 results

        except Exception as e:
            logger.error(f"Error searching places: {e}")
            return await self._get_fallback_places(mood_correlations, location)

    async def _geocode_location(self, location: str) -> Optional[Dict[str, float]]:
        """Convert location string to coordinates using Google Geocoding API."""
        url = f"https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": location,
            "key": self.api_key
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    if data["results"]:
                        loc = data["results"][0]["geometry"]["location"]
                        return {"lat": loc["lat"], "lng": loc["lng"]}
        return None

    async def _search_nearby_places(
        self,
        coords: Dict[str, float],
        keyword: str,
        radius: int = 5000
    ) -> List[Dict[str, Any]]:
        """Search for places near coordinates with a specific keyword."""
        url = f"{self.base_url}/nearbysearch/json"
        params = {
            "location": f"{coords['lat']},{coords['lng']}",
            "radius": radius,
            "keyword": keyword,
            "type": "restaurant|cafe|bar|food",
            "key": self.api_key
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("results", [])
        return []

    async def _enhance_place_details(self, place: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get detailed information about a place."""
        place_id = place.get("place_id")
        if not place_id:
            return None

        url = f"{self.base_url}/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,rating,formatted_address,types,photos,opening_hours,price_level,website",
            "key": self.api_key
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    result = data.get("result", {})

                    # Get photo URL if available
                    photo_url = None
                    if result.get("photos"):
                        photo_reference = result["photos"][0]["photo_reference"]
                        photo_url = f"{self.base_url}/photo?maxwidth=600&photoreference={photo_reference}&key={self.api_key}"

                    return {
                        "id": place_id,
                        "name": result.get("name", "Unknown Place"),
                        "type": self._get_place_type(result.get("types", [])),
                        "address": result.get("formatted_address", "Address not available"),
                        "rating": result.get("rating", 4.0),
                        "tags": result.get("types", [])[:3],  # First 3 types as tags
                        "active_users_nearby": self._simulate_user_count(),
                        "thumbnail": photo_url or self._get_placeholder_image(result.get("name", "Place")),
                        "website": result.get("website"),
                        "price_level": result.get("price_level"),
                        "opening_hours": result.get("opening_hours", {}).get("weekday_text", [])
                    }
        return None

    def _get_place_type(self, types: List[str]) -> str:
        """Extract a human-readable place type from Google Places types."""
        type_mapping = {
            "restaurant": "Restaurant",
            "cafe": "Cafe",
            "bar": "Bar",
            "bakery": "Bakery",
            "meal_takeaway": "Takeaway",
            "food": "Food Place",
            "night_club": "Night Club",
            "lodging": "Hotel"
        }

        for place_type in types:
            if place_type in type_mapping:
                return type_mapping[place_type]

        return types[0].replace("_", " ").title() if types else "Place"

    def _simulate_user_count(self) -> int:
        """Simulate active users nearby for engagement."""
        import random
        return random.randint(2, 25)

    def _get_placeholder_image(self, place_name: str) -> str:
        """Generate a placeholder image URL."""
        import random
        colors = ["3730a3", "7c3aed", "ec4899", "f59e0b", "10b981"]
        color = random.choice(colors)
        encoded_name = place_name.replace(" ", "+")
        return f"https://placehold.co/600x400/{color}/ffffff?text={encoded_name}"

    async def _get_fallback_places(
        self,
        mood_correlations: Dict[str, List[str]],
        location: str
    ) -> List[Dict[str, Any]]:
        """Fallback to mock data when Google Places API is unavailable."""

        mock_service = PlacesServices()
        return await mock_service.search_places(mood_correlations, {}, location)

    async def get_vibe_heatmap_data(
        self,
        location: str,
        radius: int = 10000
    ) -> List[Dict[str, Any]]:
        """
        Get places data for vibe heatmap visualization.
        Returns places with simulated emotion data for heatmap.
        """
        if not self.api_key:
            return []

        try:
            coords = await self._geocode_location(location)
            if not coords:
                return []

            # Search for various types of places
            place_types = ["restaurant", "cafe", "bar", "park", "shopping_mall"]
            all_places = []

            for place_type in place_types:
                places = await self._search_nearby_places(coords, place_type, radius)
                all_places.extend(places)

            # Process places for heatmap
            heatmap_data = []
            emotions = ["happy", "relaxed", "energetic", "nostalgic", "contemplative", "romantic"]

            for place in all_places[:50]:  # Limit to 50 places for performance
                # Simulate emotion intensity based on place characteristics
                emotion_data = self._generate_emotion_data(place, emotions)

                heatmap_data.append({
                    "place_id": place.get("place_id"),
                    "name": place.get("name"),
                    "location": {
                        "lat": place["geometry"]["location"]["lat"],
                        "lng": place["geometry"]["location"]["lng"]
                    },
                    "emotions": emotion_data,
                    "dominant_emotion": max(emotion_data.items(), key=lambda x: x[1])[0],
                    "rating": place.get("rating", 4.0),
                    "types": place.get("types", [])
                })

            return heatmap_data

        except Exception as e:
            logger.error(f"Error getting heatmap data: {e}")
            return []

    def _generate_emotion_data(self, place: Dict[str, Any], emotions: List[str]) -> Dict[str, float]:
        """Generate realistic emotion intensity data based on place characteristics."""
        import random

        place_types = place.get("types", [])
        rating = place.get("rating", 4.0)

        # Base emotion intensities
        emotion_data = {}

        for emotion in emotions:
            # Base intensity influenced by rating
            base_intensity = (rating / 5.0) * 0.7 + random.uniform(0.1, 0.3)

            # Adjust based on place type
            if "bar" in place_types or "night_club" in place_types:
                if emotion in ["energetic", "happy"]:
                    base_intensity *= 1.3
                elif emotion in ["contemplative", "relaxed"]:
                    base_intensity *= 0.7

            elif "cafe" in place_types:
                if emotion in ["contemplative", "relaxed"]:
                    base_intensity *= 1.2
                elif emotion in ["energetic"]:
                    base_intensity *= 0.8

            elif "restaurant" in place_types:
                if emotion in ["happy", "romantic"]:
                    base_intensity *= 1.2

            elif "park" in place_types:
                if emotion in ["relaxed", "contemplative"]:
                    base_intensity *= 1.3

            emotion_data[emotion] = min(1.0, base_intensity)

        return emotion_data
