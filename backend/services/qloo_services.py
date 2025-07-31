import httpx
import os
from typing import Dict, List, Any

class QlooService:
    """
    Service for interacting with the Qloo API for cultural recommendations.
    This service fetches taste profiles and mood-based correlations.
    """
    def __init__(self):
        """Initializes the QlooService with API key and base URL."""
        self.api_key = os.getenv("QLOO_API_KEY")
        self.base_url = "https://hackathon.api.qloo.com/v2"
        if not self.api_key:
            print("Warning: QLOO_API_KEY environment variable not set. Using mock data.")

    async def get_taste_profile(self, user_preferences: Dict) -> Dict:
        """
        Gets a user's taste profile from Qloo based on their preferences.
        For the hackathon, this will be a mock implementation as user-specific
        taste profiles may not be available.
        """
        # In a real scenario, you would pass user preferences to Qloo.
        # For this hackathon, we return a consistent, rich mock profile.
        print("QlooService: Returning mock taste profile.")
        return {
            "taste_clusters": ["indie_contemplative", "comfort_seeking", "urban_explorer"],
            "food_preferences": ["ramen", "coffee_shops", "ethnic_comfort", "bakeries"],
            "ambiance_preferences": ["quiet", "dim_lighting", "background_music", "cozy"],
            "cultural_interests": ["live music", "art galleries", "independent films"]
        }

    async def get_mood_correlations(self, mood: str, taste_profile: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Get cultural correlations for a specific mood and taste profile combination from Qloo.
        This uses the Qloo API's correlation endpoint.
        """
        if not self.api_key:
            print("QlooService: Using mock mood correlations due to missing API key.")
            return self._get_mock_mood_correlations(mood)

        # The Qloo hackathon API might have a specific endpoint for this.
        # We will simulate a call to a hypothetical endpoint.
        # The actual Qloo API uses domain-specific IDs (e.g., for movies, music).
        # We will use the text-based preferences from the taste profile as keywords.

        endpoint = f"{self.base_url}/correlations/taste"
        headers = {"Authorization": f"Bearer {self.api_key}"}

        # Construct a query based on the user's mood and taste profile
        # This is a hypothetical payload structure for the hackathon.
        payload = {
            "mood": mood,
            "tastes": {
                "keywords": taste_profile.get("food_preferences", []) + taste_profile.get("ambiance_preferences", [])
            },
            "target_domains": ["dining", "ambiance"]
        }

        try:
            async with httpx.AsyncClient() as client:
                # Since the endpoint is hypothetical, we'll rely on the mock data as a fallback.
                # In a real scenario, this response would be processed.
                # response = await client.post(endpoint, json=payload, headers=headers, timeout=10.0)
                # response.raise_for_status()
                # return response.json().get('correlations', {})
                print("QlooService: Simulating API call, returning mock correlations.")
                return self._get_mock_mood_correlations(mood)

        except httpx.HTTPStatusError as e:
            print(f"Qloo API error: {e}")
            print(f"Falling back to mock data for mood: {mood}")
            return self._get_mock_mood_correlations(mood)
        except Exception as e:
            print(f"An unexpected error occurred while calling Qloo API: {e}")
            return self._get_mock_mood_correlations(mood)

    def _get_mock_mood_correlations(self, mood: str) -> Dict[str, List[str]]:
        """Provides mock data for mood correlations as a reliable fallback."""
        mood_mappings = {
            "anxious": {
                "search_keywords": ["quiet cafe", "cozy bakery", "comfort food", "ramen"],
                "ambiance": ["soft_lighting", "minimal_crowds", "gentle_music", "calm"]
            },
            "lonely": {
                "search_keywords": ["communal table restaurant", "friendly bar", "diner", "coffee shop"],
                "ambiance": ["warm_lighting", "background_chatter", "welcoming_staff", "social"]
            },
            "celebratory": {
                "search_keywords": ["rooftop bar", "cocktail lounge", "fine dining", "lively restaurant"],
                "ambiance": ["energetic", "city views", "live music", "upscale"]
            },
            "nostalgic": {
                "search_keywords": ["old-fashioned diner", "classic bakery", "retro bar", "traditional cuisine"],
                "ambiance": ["vintage_decor", "classic_music", "familiar", "warm"]
            },
             "stressed": {
                "search_keywords": ["quiet tea house", "soup restaurant", "calm park cafe", "bookstore cafe"],
                "ambiance": ["peaceful", "natural light", "minimalist", "soothing"]
            },
            "contemplative": {
                "search_keywords": ["art gallery cafe", "library cafe", "scenic view restaurant", "wine bar"],
                "ambiance": ["inspiring", "quiet", "elegant", "sophisticated"]
            },
            "energetic": {
                "search_keywords": ["food hall", "tapas bar", "brewery", "busy bistro"],
                "ambiance": ["vibrant", "lively", "social", "bustling"]
            },
             "melancholic": {
                "search_keywords": ["dimly lit bar", "quiet noodle shop", "rainy day cafe", "jazz club"],
                "ambiance": ["introspective", "dim_lighting", "soulful_music", "cozy"]
            }
        }
        return mood_mappings.get(mood, mood_mappings['contemplative']) # Default fallback
