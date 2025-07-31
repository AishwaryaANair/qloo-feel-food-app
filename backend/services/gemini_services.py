from google import genai
from google.genai import types
import json
import os
from typing import Dict, Optional

class GeminiService:
    def __init__(self):
        # Initialize the new Google Gen AI client
        self.client = genai.Client(
            api_key=os.getenv("GEMINI_API_KEY")
        )

        # Configuration for consistent responses
        self.generation_config = types.GenerateContentConfig(
            temperature=0.8, # Slightly higher for more creative questions
            top_p=0.95,
            max_output_tokens=2048,
            response_mime_type="text/plain",
        )

        # For JSON responses
        self.json_config = types.GenerateContentConfig(
            temperature=0.3,
            top_p=0.95,
            max_output_tokens=2048,
            response_mime_type="application/json",
        )

    async def generate_place_description(self, place: Dict, mood: str, cultural_context: Dict) -> str:
        """Generate emotionally-aware place description"""
        prompt = f"""
        Generate a brief, emotionally resonant description for this place:
        Place: {place['name']}
        Type: {place.get('type', 'restaurant')}
        User mood: {mood}
        Cultural preferences: {json.dumps(cultural_context, indent=2)}

        Requirements:
        - Make it feel like the perfect match for their current emotional state
        - Keep it under 50 words
        - Be warm and inviting
        - Reference specific details that would appeal to someone in this mood
        """

        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-pro',
                contents=prompt,
                config=self.generation_config
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback response
            return "A quiet corner where the world slows down. Soft jazz mingles with coffee aroma, and the bartender remembers that some nights you just need soup and silence."

    async def analyze_mood_from_text(self, user_text: str) -> Dict:
        """Extract mood and preferences from natural language input"""
        prompt = f"""
        Analyze this text and extract emotional state and preferences.

        User text: "{user_text}"

        Return a JSON object with these exact keys:
        {{
            "mood": "primary emotion (anxious/lonely/nostalgic/stressed/contemplative/celebratory)",
            "intensity": 1-10 scale,
            "atmosphere": "desired environment (quiet/lively/cozy/anonymous/social)",
            "food_hints": ["array", "of", "food", "preferences"],
            "time_preference": "now/soon/flexible"
        }}

        Be accurate but err on the side of gentle moods if uncertain.
        """

        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-pro',
                contents=prompt,
                generation_config=self.json_config
            )

            return json.loads(response.text)

        except Exception as e:
            print(f"Gemini API error: {e}")
            return {
                "mood": "contemplative",
                "intensity": 5,
                "atmosphere": "quiet",
                "food_hints": ["warm", "comforting"],
                "time_preference": "now"
            }

    async def generate_emotional_insight(self, mood_data: Dict, place_data: Dict) -> str:
        """Generate a brief insight about why this place matches the mood"""
        prompt = f"""
        Create a one-sentence insight about why this place is perfect for this mood.

        Mood: {mood_data}
        Place: {place_data}

        Make it poetic but genuine. Like a friend who really gets it.
        Maximum 20 words.
        """

        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-pro',
                contents=prompt,
                generation_config=self.generation_config
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
            return "Sometimes the right place finds you when you need it most."

    async def generate_vibe_check_question(self, mood: str, place_type: str) -> str:
        """
        Generates a random, mood-specific question to ask others about a place's vibe.
        """
        prompt = f"""
        You are an expert at crafting engaging, open-ended questions.
        Your goal is to create one single question for a "vibe check" feature in an app.
        The question should be asked to people who are at a specific place.
        The question needs to be tailored to a user who is feeling a certain mood.

        User's Mood: {mood}
        Type of Place: {place_type}

        Requirements:
        - The question should be friendly, short, and inviting.
        - It should encourage a brief, insightful answer about the atmosphere of the place.
        - Do NOT make it a yes/no question.
        - Frame it as if you're asking someone already there.
        - Maximum 25 words.

        Example for mood 'anxious' at a 'cafe':
        "For someone feeling a bit on edge, does the atmosphere here feel more calming or energizing?"

        Example for mood 'celebratory' at a 'rooftop bar':
        "What's the one thing about the vibe here that makes it perfect for a celebration?"

        Example for mood 'lonely' at a 'diner':
        "Does the vibe here feel more like a quiet solo spot or a place with friendly background chatter?"

        Now, generate a question for the given mood and place type.
        """
        try:
            response = await self.client.aio.models.generate_content(
                model='gemini-pro',
                contents=prompt,
                generation_config=self.generation_config
            )
            return response.text.strip().strip('"')
        except Exception as e:
            print(f"Gemini API error during vibe question generation: {e}")
            # Fallback question
            return f"For someone feeling {mood}, what's the general vibe like at this {place_type} right now?"
