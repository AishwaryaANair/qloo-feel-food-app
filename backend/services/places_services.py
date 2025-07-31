from typing import Dict, List, Any
import random

class PlacesService:
    """
    Service for finding physical places.
    In a real application, this would connect to an API like Google Places or Foursquare.
    For this hackathon, it simulates finding places based on search criteria.
    """
    def __init__(self):
        """Initializes the PlacesService."""
        print("PlacesService: Initialized with mock search functionality.")

    async def search_places(
        self,
        mood_correlations: Dict[str, List[str]],
        mood_input: Dict[str, Any],
        location: str = "San Francisco, CA" # Default location
    ) -> List[Dict[str, Any]]:
        """
        Searches for places that match the mood-based criteria.
        This is a mock implementation that generates realistic-looking place data.
        """
        print(f"PlacesService: Searching for places near {location} based on mood correlations.")

        search_keywords = mood_correlations.get("search_keywords", ["cafe", "restaurant"])
        num_places = random.randint(3, 5)

        recommended_places = []
        for i in range(num_places):
            place_type = random.choice(search_keywords)
            place = self._generate_mock_place(place_type, location, i)
            recommended_places.append(place)

        return recommended_places

    def _generate_mock_place(self, place_type: str, location: str, index: int) -> Dict[str, Any]:
        """Generates a single mock place dictionary."""

        # Mock place names based on type
        name_templates = {
            "cafe": ["The Cozy Corner", "Uptown Grind", "The Daily Bean", "Artisan Roast"],
            "diner": ["Midnight Munchies", "The Silver Spoon", "Classic Eats Diner"],
            "bar": ["The Alchemist's Den", "Starlight Lounge", "The Local Taproom"],
            "restaurant": ["The Golden Fork", "Urban Table", "Saffron Spice"],
            "bakery": ["The Rolling Pin", "Sweet Crumbs", "Morning Bun Bakery"]
        }

        base_name = random.choice(name_templates.get(place_type.split(" ")[-1], name_templates["restaurant"]))

        return {
            "id": f"place_{place_type.replace(' ', '_')}_{index}",
            "name": f"{base_name}",
            "type": place_type,
            "address": f"{random.randint(100, 1999)} Main St, {location}",
            "rating": round(random.uniform(3.8, 4.9), 1),
            "tags": [place_type.capitalize(), "Comfort Food", "Local Favorite"] if "comfort" in place_type else [place_type.capitalize(), "Trendy"],
            "active_users_nearby": random.randint(2, 15), # Simulate other users
            "thumbnail": f"https://placehold.co/600x400/{random.choice(['2d3748','4a5568','718096'])}/ffffff?text={base_name.replace(' ', '+')}"
        }
