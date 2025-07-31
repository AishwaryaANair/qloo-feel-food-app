"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MoodSelector from "../components/MoodSelector";
import RecommendationCard from "../components/RecommendationCard";
import { MoodData, RecommendationResponse, Place } from "../../lib/types";
import { Loader, AlertTriangle } from "lucide-react";

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

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <Loader className="w-16 h-16 animate-spin text-white" />
              <p className="mt-4 text-xl">
                Finding the perfect vibe for you...
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[80vh] text-center"
            >
              <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                Oops! Something went wrong.
              </h2>
              <p className="text-red-300 mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-white text-purple-900 rounded-lg font-semibold"
              >
                Try Again
              </button>
            </motion.div>
          ) : recommendationData ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center mb-12">
                <button
                  onClick={handleReset}
                  className="text-purple-300 hover:text-white transition mb-4"
                >
                  &larr; Back to mood selection
                </button>
                <h1 className="text-4xl font-bold">Your Comfort Zone</h1>
                <p className="text-purple-200 mt-2 text-lg max-w-2xl mx-auto">
                  &ldquo;{recommendationData.mood_insights}&rdquo;
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendationData.recommendations.map((place) => (
                  <RecommendationCard key={place.id} place={place} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="selector" exit={{ opacity: 0, y: -20 }}>
              <MoodSelector onMoodSelect={handleGetRecommendations} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
