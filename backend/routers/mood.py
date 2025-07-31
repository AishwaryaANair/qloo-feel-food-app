from fastapi import APIRouter
from models.moods import MoodType
from typing import List

router = APIRouter()

@router.get("/list", response_model=List[str])
async def get_available_moods():
    """
    Returns a list of all available mood types that the system can process.
    """
    return [mood.value for mood in MoodType]
