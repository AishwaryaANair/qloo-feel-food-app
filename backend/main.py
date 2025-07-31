from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers import mood, recommendations, vibe, places
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="VibeCheck API",
    description="AI-powered mood-based recommendations for food, places, music, and activities",
    version="2.0.0"
)

# CORS middleware - Updated for broader development support
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "https://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(mood.router, prefix="/api/mood", tags=["Moods"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(vibe.router, prefix="/api/vibe", tags=["Vibe Check"])
app.include_router(places.router, prefix="/api/places", tags=["Places & Heatmap"])

@app.get("/")
async def root():
    return {
        "message": "Vibe Check API v2.0 - Where emotions meet food, places, music, and experiences",
        "features": [
            "Mood-based place recommendations",
            "Google Places integration",
            "Music recommendations via Qloo",
            "Activity suggestions",
            "Vibe heatmaps",
            "AI-powered vibe check questions",
            "Cross-domain recommendations"
        ],
        "endpoints": {
            "places": "/api/recommendations/get-recommendations",
            "heatmap": "/api/places/heatmap",
            "vibe_check": "/api/vibe/question",
            "music": "/api/recommendations/get-music-for-place",
            "activities": "/api/recommendations/get-activities-for-mood"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
