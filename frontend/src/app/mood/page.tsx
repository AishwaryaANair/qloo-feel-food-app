"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import MoodSelector from "../components/MoodSelector";
import RecommendationCard from "../components/RecommendationCard";
import { MoodData, RecommendationResponse } from "../lib/types";
import { ArrowLeft } from "lucide-react";

export default function MoodPage() {
  const [recommendationData, setRecommendationData] =
    useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetRecommendations = async (moodData: MoodData) => {
    setIsLoading(true);
    setError(null);
    setRecommendationData(null);

    try {
      const response = await fetch(
        "http://localhost:8000/api/recommendations/get-recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(moodData),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to get recommendations.");
      }

      const data: RecommendationResponse = await response.json();
      setRecommendationData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRecommendationData(null);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">finding your vibe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-black mb-4">something went wrong.</p>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button onClick={handleReset} className="minimal-button py-3 px-6">
            try again
          </button>
        </div>
      </div>
    );
  }

  if (recommendationData) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="px-6 py-8 border-b border-gray-100">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-black mb-4 hover:underline"
          >
            <ArrowLeft size={16} />
            <span>back</span>
          </button>
          <h1 className="text-2xl font-bold text-black mb-2">
            places for your vibe
          </h1>
          <p className="text-gray-600 text-sm">
            {recommendationData.mood_insights}
          </p>
        </div>

        {/* Results */}
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            {recommendationData.recommendations.places.map((place) => (
              <RecommendationCard
                key={place.id}
                place={place}
                musicRecommendations={recommendationData.recommendations.music}
                activityRecommendations={
                  recommendationData.recommendations.activities
                }
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <MoodSelector onMoodSelect={handleGetRecommendations} />;
}
