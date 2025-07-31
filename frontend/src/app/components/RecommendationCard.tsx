"use client";

import { Place } from "../lib/types";
import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface RecommendationCardProps {
  place: Place;
  musicRecommendations?: Array<{
    title: string;
    artist: string;
    genre: string;
    energy: number;
  }>;
  activityRecommendations?: Array<{
    name: string;
    type: string;
    duration: string;
    energy_required: string;
  }>;
}

export default function RecommendationCard({
  place,
  musicRecommendations = [],
  activityRecommendations = [],
}: RecommendationCardProps) {
  const [showExtras, setShowExtras] = useState(false);
  const [activeTab, setActiveTab] = useState<"music" | "activities">("music");

  const hasExtras =
    musicRecommendations.length > 0 || activityRecommendations.length > 0;

  return (
    <div className="minimal-card p-6 mb-6">
      {/* Place Image */}
      <div className="mb-4">
        <img
          src={place.thumbnail}
          alt={place.name}
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(place.name)}`;
          }}
        />
      </div>

      {/* Place Info */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-black mb-1">{place.name}</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{place.type}</span>
          <span className="text-sm text-black font-medium">
            ★ {place.rating}
          </span>
        </div>
        <p className="text-gray-700 text-sm mb-3">
          {place.emotional_description}
        </p>
        {place.website && (
          <a
            href={place.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-black hover:underline"
          >
            <ExternalLink size={14} />
            <span>website</span>
          </a>
        )}
      </div>

      {/* Extras Toggle */}
      {hasExtras && (
        <div className="mb-4">
          <button
            onClick={() => setShowExtras(!showExtras)}
            className="w-full flex items-center justify-between py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-black font-medium">music & activities</span>
            {showExtras ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      )}

      {/* Extras Content */}
      {showExtras && hasExtras && (
        <div className="mb-4 bg-gray-50 rounded-lg p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("music")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "music"
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              music ({musicRecommendations.length})
            </button>
            <button
              onClick={() => setActiveTab("activities")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "activities"
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              activities ({activityRecommendations.length})
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-3">
            {activeTab === "music" && (
              <>
                {musicRecommendations.map((music, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <div>
                      <p className="text-black font-medium text-sm">
                        {music.title}
                      </p>
                      <p className="text-gray-600 text-xs">{music.artist}</p>
                    </div>
                    <span className="text-xs text-gray-500">{music.genre}</span>
                  </div>
                ))}
                {musicRecommendations.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    no music recommendations
                  </p>
                )}
              </>
            )}

            {activeTab === "activities" && (
              <>
                {activityRecommendations.map((activity, index) => (
                  <div key={index} className="py-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-black font-medium text-sm">
                        {activity.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {activity.duration}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs">{activity.type}</p>
                  </div>
                ))}
                {activityRecommendations.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    no activity recommendations
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Simple Vibe Check */}
      <div className="border-t border-gray-200 pt-4">
        <button className="w-full minimal-button-secondary py-3 px-4 text-sm">
          vibe check this place
        </button>
      </div>
    </div>
  );
}
