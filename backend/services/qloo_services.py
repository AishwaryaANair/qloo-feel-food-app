import httpx
import os
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class QlooService:
    """
    Enhanced service for interacting with the Qloo API for cultural recommendations.
    Includes food, music, activities, and cross-domain recommendations.
    """

    def __init__(self):
        self.api_key = os.getenv("QLOO_API_KEY")
        self.base_url = "https://hackathon.api.qloo.com/v2"
        if not self.api_key:
            logger.warning("QLOO_API_KEY environment variable not set. Using mock data.")

    async def get_taste_profile(self, user_preferences: Dict) -> Dict:
        """Get a user's taste profile from Qloo based on their preferences."""
        if not self.api_key:
            return self._get_mock_taste_profile()

        # For hackathon, we'll use a combination of mock and real data
        # Real implementation would build profile from user interactions
        return self._get_mock_taste_profile()

    async def get_mood_correlations(self, mood: str, taste_profile: Dict[str, Any]) -> Dict[str, List[str]]:
        """Get cultural correlations for a specific mood and taste profile combination from Qloo."""
        if not self.api_key:
            return self._get_mock_mood_correlations(mood)

        try:
            # Construct query based on mood and taste profile
            payload = {
                "mood": mood,
                "tastes": {
                    "keywords": taste_profile.get("food_preferences", []) +
                              taste_profile.get("ambiance_preferences", [])
                },
                "target_domains": ["dining", "music", "activities"]
            }

            async with httpx.AsyncClient() as client:
                # This would be the actual Qloo API call
                # For now, we'll return enhanced mock data
                logger.info(f"Getting Qloo correlations for mood: {mood}")
                return self._get_mock_mood_correlations(mood)

        except Exception as e:
            logger.error(f"Qloo API error: {e}")
            return self._get_mock_mood_correlations(mood)

    async def get_music_recommendations(self, mood: str, taste_profile: Dict) -> List[Dict[str, Any]]:
        """Get music recommendations based on mood and taste profile."""
        if not self.api_key:
            return self._get_mock_music_recommendations(mood)

        try:
            # Real Qloo API call would go here
            # For hackathon, using enhanced mock data
            return self._get_mock_music_recommendations(mood)

        except Exception as e:
            logger.error(f"Error getting music recommendations: {e}")
            return self._get_mock_music_recommendations(mood)

    async def get_activity_recommendations(self, mood: str, taste_profile: Dict) -> List[Dict[str, Any]]:
        """Get activity recommendations based on mood and taste profile."""
        if not self.api_key:
            return self._get_mock_activity_recommendations(mood)

        try:
            # Real Qloo API call would go here
            return self._get_mock_activity_recommendations(mood)

        except Exception as e:
            logger.error(f"Error getting activity recommendations: {e}")
            return self._get_mock_activity_recommendations(mood)

    async def get_cross_domain_recommendations(
        self,
        primary_item: Dict[str, Any],
        target_domains: List[str]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get cross-domain recommendations. E.g., given a restaurant,
        recommend music and activities that pair well.
        """
        if not self.api_key:
            return self._get_mock_cross_domain_recommendations(primary_item, target_domains)

        try:
            # Real Qloo API implementation
            return self._get_mock_cross_domain_recommendations(primary_item, target_domains)

        except Exception as e:
            logger.error(f"Error getting cross-domain recommendations: {e}")
            return self._get_mock_cross_domain_recommendations(primary_item, target_domains)

    def _get_mock_taste_profile(self) -> Dict:
        """Enhanced mock taste profile with more dimensions."""
        return {
            "taste_clusters": ["indie_contemplative", "comfort_seeking", "urban_explorer", "cultural_curious"],
            "food_preferences": ["artisanal_coffee", "ethnic_fusion", "comfort_food", "local_specialties"],
            "music_preferences": ["indie_folk", "ambient_electronic", "jazz_fusion", "world_music"],
            "activity_preferences": ["cultural_exploration", "quiet_socializing", "creative_pursuits", "mindful_experiences"],
            "ambiance_preferences": ["intimate_lighting", "natural_textures", "curated_music", "thoughtful_design"],
            "cultural_interests": ["independent_art", "local_history", "sustainable_living", "authentic_experiences"],
            "personality_traits": ["introspective", "curious", "aesthetically_aware", "community_minded"]
        }

    def _get_mock_mood_correlations(self, mood: str) -> Dict[str, List[str]]:
        """Enhanced mood mappings with more nuanced correlations."""
        mood_mappings = {
            "anxious": {
                "search_keywords": ["quiet cafe", "tea house", "comfort food", "soup kitchen", "meditation space"],
                "ambiance": ["soft_lighting", "minimal_crowds", "gentle_music", "calming_colors"],
                "music_genres": ["ambient", "classical", "lo-fi", "nature_sounds"],
                "activities": ["reading", "journaling", "gentle_walks", "breathing_exercises"]
            },
            "lonely": {
                "search_keywords": ["communal dining", "coffee shop", "neighborhood bar", "community center"],
                "ambiance": ["warm_lighting", "friendly_staff", "community_feel", "welcoming_atmosphere"],
                "music_genres": ["indie_folk", "acoustic", "singer_songwriter", "warm_vocals"],
                "activities": ["book_clubs", "community_events", "group_classes", "volunteering"]
            },
            "celebratory": {
                "search_keywords": ["rooftop bar", "fine dining", "champagne bar", "festive restaurant"],
                "ambiance": ["upscale", "energetic", "special_occasion", "elegant"],
                "music_genres": ["upbeat_pop", "celebration_classics", "dance", "live_music"],
                "activities": ["dancing", "live_shows", "special_events", "photo_opportunities"]
            },
            "nostalgic": {
                "search_keywords": ["classic diner", "vintage bar", "traditional cuisine", "family_restaurant"],
                "ambiance": ["retro_decor", "familiar_comfort", "timeless_atmosphere", "memory_inducing"],
                "music_genres": ["classic_rock", "oldies", "vintage_jazz", "folk_classics"],
                "activities": ["reminiscing", "photo_viewing", "storytelling", "memory_sharing"]
            },
            "stressed": {
                "search_keywords": ["zen cafe", "quiet restaurant", "nature_view_dining", "minimal_space"],
                "ambiance": ["peaceful", "uncluttered", "natural_elements", "stress_relieving"],
                "music_genres": ["meditation_music", "spa_sounds", "instrumental", "soft_jazz"],
                "activities": ["meditation", "yoga", "nature_walks", "stress_relief"]
            },
            "contemplative": {
                "search_keywords": ["library cafe", "art gallery restaurant", "philosophy_cafe", "scenic_dining"],
                "ambiance": ["thought_provoking", "intellectually_stimulating", "quiet_corners", "inspiring_views"],
                "music_genres": ["classical", "experimental", "thoughtful_lyrics", "ambient_classical"],
                "activities": ["reading", "writing", "art_appreciation", "deep_conversations"]
            },
            "energetic": {
                "search_keywords": ["bustling_market", "sports_bar", "active_dining", "food_hall"],
                "ambiance": ["high_energy", "dynamic", "social_buzz", "vibrant_atmosphere"],
                "music_genres": ["electronic", "rock", "pop", "high_tempo"],
                "activities": ["sports", "dancing", "active_games", "social_events"]
            },
            "melancholic": {
                "search_keywords": ["dimly_lit_bar", "intimate_restaurant", "quiet_corner_cafe", "contemplative_space"],
                "ambiance": ["moody_lighting", "introspective", "emotional_resonance", "cathartic"],
                "music_genres": ["melancholic_indie", "blues", "sad_songs", "emotional_ballads"],
                "activities": ["journaling", "artistic_expression", "quiet_reflection", "emotional_processing"]
            }
        }

        return mood_mappings.get(mood, mood_mappings['contemplative'])

    def _get_mock_music_recommendations(self, mood: str) -> List[Dict[str, Any]]:
        """Mock music recommendations based on mood."""
        music_by_mood = {
            "anxious": [
                {"title": "Weightless", "artist": "Marconi Union", "genre": "Ambient", "energy": 0.2},
                {"title": "River", "artist": "Joni Mitchell", "genre": "Folk", "energy": 0.3},
                {"title": "Mad World", "artist": "Gary Jules", "genre": "Alternative", "energy": 0.4}
            ],
            "lonely": [
                {"title": "The Night We Met", "artist": "Lord Huron", "genre": "Indie Folk", "energy": 0.5},
                {"title": "Skinny Love", "artist": "Bon Iver", "genre": "Indie Folk", "energy": 0.4},
                {"title": "Black", "artist": "Pearl Jam", "genre": "Alternative Rock", "energy": 0.6}
            ],
            "celebratory": [
                {"title": "Good as Hell", "artist": "Lizzo", "genre": "Pop", "energy": 0.9},
                {"title": "Uptown Funk", "artist": "Bruno Mars", "genre": "Pop", "energy": 0.95},
                {"title": "Can't Stop the Feeling", "artist": "Justin Timberlake", "genre": "Pop", "energy": 0.88}
            ],
            "contemplative": [
                {"title": "The Scientist", "artist": "Coldplay", "genre": "Alternative Rock", "energy": 0.5},
                {"title": "Holocene", "artist": "Bon Iver", "genre": "Indie Folk", "energy": 0.4},
                {"title": "Breathe Me", "artist": "Sia", "genre": "Alternative", "energy": 0.3}
            ]
        }

        return music_by_mood.get(mood, music_by_mood["contemplative"])

    def _get_mock_activity_recommendations(self, mood: str) -> List[Dict[str, Any]]:
        """Mock activity recommendations based on mood."""
        activities_by_mood = {
            "anxious": [
                {"name": "Meditation Session", "type": "Wellness", "duration": "30 min", "energy_required": "Low"},
                {"name": "Gentle Yoga", "type": "Exercise", "duration": "60 min", "energy_required": "Low"},
                {"name": "Nature Walk", "type": "Outdoor", "duration": "45 min", "energy_required": "Medium"}
            ],
            "lonely": [
                {"name": "Community Art Class", "type": "Social/Creative", "duration": "120 min", "energy_required": "Medium"},
                {"name": "Book Club Meeting", "type": "Social/Intellectual", "duration": "90 min", "energy_required": "Low"},
                {"name": "Volunteer at Local Shelter", "type": "Social/Service", "duration": "180 min", "energy_required": "Medium"}
            ],
            "celebratory": [
                {"name": "Dancing Class", "type": "Social/Physical", "duration": "90 min", "energy_required": "High"},
                {"name": "Karaoke Night", "type": "Social/Entertainment", "duration": "120 min", "energy_required": "Medium"},
                {"name": "Rooftop Party", "type": "Social/Entertainment", "duration": "240 min", "energy_required": "High"}
            ],
            "contemplative": [
                {"name": "Museum Visit", "type": "Cultural/Educational", "duration": "150 min", "energy_required": "Medium"},
                {"name": "Creative Writing Workshop", "type": "Creative/Intellectual", "duration": "120 min", "energy_required": "Medium"},
                {"name": "Philosophy Discussion Group", "type": "Intellectual/Social", "duration": "90 min", "energy_required": "Low"}
            ]
        }

        return activities_by_mood.get(mood, activities_by_mood["contemplative"])

    def _get_mock_cross_domain_recommendations(
        self,
        primary_item: Dict[str, Any],
        target_domains: List[str]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Mock cross-domain recommendations based on a primary item."""
        recommendations = {}

        place_type = primary_item.get("type", "").lower()

        if "music" in target_domains:
            if "cafe" in place_type:
                recommendations["music"] = [
                    {"title": "Cafe Playlist", "artist": "Various", "vibe": "Cozy, Productive"},
                    {"title": "Acoustic Sessions", "artist": "Various", "vibe": "Intimate, Warm"}
                ]
            elif "bar" in place_type:
                recommendations["music"] = [
                    {"title": "Late Night Jazz", "artist": "Various", "vibe": "Sophisticated, Relaxed"},
                    {"title": "Cocktail Hour", "artist": "Various", "vibe": "Social, Elegant"}
                ]

        if "activities" in target_domains:
            if "restaurant" in place_type:
                recommendations["activities"] = [
                    {"name": "After Dinner Walk", "type": "Outdoor", "duration": "30 min"},
                    {"name": "Dessert & Coffee", "type": "Dining", "duration": "45 min"}
                ]

        return recommendations
