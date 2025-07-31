// src/app/heatmap/page.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import VibeHeatmap from "../components/VibeHeatmap";

export default function HeatmapPage() {
  const router = useRouter();
  const [location, setLocation] = useState("San Francisco, CA");
  const [showSettings, setShowSettings] = useState(false);

  const popularLocations = [
    "San Francisco, CA",
    "New York, NY",
    "Los Angeles, CA",
    "Chicago, IL",
    "Austin, TX",
    "Portland, OR",
    "Seattle, WA",
    "Miami, FL",
  ];

  return (
    <main className="min-h-screen w-full bg-white text-black p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-black">Vibe Heatmap</h1>
              <p className="text-gray-600 mt-1">
                Explore emotional landscapes across the city
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="minimal-card p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
              <MapPin size={18} />
              Location Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city, state or address..."
                  className="w-full minimal-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Popular Locations
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {popularLocations.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        location === loc
                          ? "minimal-button"
                          : "minimal-button-secondary"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Heatmap Component */}
        <VibeHeatmap location={location} />

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 minimal-card p-6"
        >
          <h3 className="text-lg font-semibold text-black mb-4">
            How Vibe Heatmaps Work
          </h3>

          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-black mb-2">Data Collection</h4>
              <p>
                We analyze real places using Google Places API combined with
                AI-generated emotion profiles based on place characteristics,
                reviews, and ambiance factors.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-black mb-2">Emotion Mapping</h4>
              <p>
                Each location gets scored across 8 emotional dimensions. The
                size and color of markers represent the intensity and dominant
                emotion at that location.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-black mb-2">Real-time Updates</h4>
              <p>
                Emotion data updates based on user vibe checks, reviews, and
                contextual factors like time of day, weather, and current events
                in the area.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
