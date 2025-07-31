from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers import mood, recommendations, vibe
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="VibeCheck API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(mood.router, prefix="/api/mood", tags=["Moods"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(vibe.router, prefix="/api/vibe", tags=["Vibe Check"])

@app.get("/")
async def root():
    return {"message": "Vibe Check API - Where emotions meet food and places"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
