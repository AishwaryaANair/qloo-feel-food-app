from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class MoodType(str, Enum):
    ANXIOUS = "anxious"
    LONELY = "lonely"
    CELEBRATORY = "celebratory"
    NOSTALGIC = "nostalgic"
    STRESSED = "stressed"
    CONTEMPLATIVE = "contemplative"
    ENERGETIC = "energetic"
    MELANCHOLIC = "melancholic"
    SATISFACTIOM = "satisfaction"
    DISAPPOINTMENT = "disappointment"
    LETHARGY = "lethargy"
    RELAXED = "relaxed"
    ROMANTIC = "romantic"
    INSPIRED = "inspired"
    CURIOUS = "curious"
    AWKWARD = "awkward"
    SURPRISED = "surprised"
    GRATEFUL = "grateful"
    ADVENTUROUS = "adventurous"
    BORED = "bored"
    OVERWHELMED = "overwhelmed"
    COMFORTED = "comforted"
    EXHILARATED = "exhilarated"
    DISGUSTED = "disgusted"


class MoodInput(BaseModel):
    primary_mood: MoodType
    intensity: int  # 1-10
    context: Optional[str] = None  # "just got dumped", "work stress", etc.
    time_preference: Optional[str] = None  # "need quiet", "want crowds", etc.

class UserPreferences(BaseModel):
    # TODO: Replace with actual Qloo taste profile
    favorite_cuisines: List[str] = []
    music_preferences: List[str] = []
    activity_preferences: List[str] = []
    cultural_interests: List[str] = []
