"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Palette, Filter } from "lucide-react";

interface EmotionData {
  [key: string]: number;
}

interface HeatmapPlace {
  place_id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  emotions: EmotionData;
  dominant_emotion: string;
  rating: number;
  types: string[];
}

interface VibeHeatmapProps {
  location?: string;
}

const EMOTION_COLORS = {
  happy: "#f59e0b",
  relaxed: "#10b981",
  energetic: "#ef4444",
  nostalgic: "#8b5cf6",
  contemplative: "#06b6d4",
  romantic: "#ec4899",
  anxious: "#f97316",
  lonely: "#6366f1",
} as const;

const EMOTION_LABELS = {
  happy: "Happy",
  relaxed: "Relaxed",
  energetic: "Energetic",
  nostalgic: "Nostalgic",
  contemplative: "Contemplative",
  romantic: "Romantic",
  anxious: "Anxious",
  lonely: "Lonely",
} as const;

export default function VibeHeatmap({
  location = "San Francisco, CA",
}: VibeHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPlace[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco default
        zoom: 13,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#1a1a2e" }],
          },
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#ffffff" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#16213e" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#2d3748" }],
          },
        ],
      });

      setMap(mapInstance);
    };

    // Load Google Maps script if not already loaded
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=visualization`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // Fetch heatmap data
  useEffect(() => {
    const fetchHeatmapData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:8000/api/places/heatmap?location=${encodeURIComponent(location)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch heatmap data");
        }

        const data = await response.json();
        setHeatmapData(data.places || []);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching heatmap data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatmapData();
  }, [location]);

  // Update map markers when data or filter changes
  useEffect(() => {
    if (!map || !heatmapData.length) return;

    // Clear existing markers
    // Note: In a real implementation, you'd want to track markers to clear them

    const filteredData =
      selectedEmotion === "all"
        ? heatmapData
        : heatmapData.filter(
            (place) => place.dominant_emotion === selectedEmotion,
          );

    // Add new markers
    filteredData.forEach((place) => {
      const emotionColor =
        EMOTION_COLORS[place.dominant_emotion as keyof typeof EMOTION_COLORS] ||
        "#6b7280";
      const intensity = place.emotions[place.dominant_emotion] || 0.5;

      const marker = new google.maps.Marker({
        position: place.location,
        map: map,
        title: place.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8 + intensity * 12, // Size based on emotion intensity
          fillColor: emotionColor,
          fillOpacity: 0.7,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      // Info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 bg-slate-800 text-white rounded-lg max-w-xs">
            <h3 class="font-bold text-lg mb-2">${place.name}</h3>
            <div class="flex items-center gap-2 mb-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${emotionColor}"></div>
              <span class="text-sm">${EMOTION_LABELS[place.dominant_emotion as keyof typeof EMOTION_LABELS]}</span>
            </div>
            <div class="text-sm text-gray-300">
              <p>Rating: ${place.rating}/5</p>
              <p>Intensity: ${Math.round(intensity * 100)}%</p>
            </div>
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
    });

    // Center map on data
    if (filteredData.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredData.forEach((place) => {
        bounds.extend(place.location);
      });
      map.fitBounds(bounds);
    }
  }, [map, heatmapData, selectedEmotion]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 glass-morphism rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white">Loading vibe heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 glass-morphism rounded-2xl">
        <div className="text-center text-red-400">
          <MapPin className="w-12 h-12 mx-auto mb-4" />
          <p>Error loading heatmap: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Vibe Heatmap</h2>
        <p className="text-purple-200">
          Discover the emotional landscape of places around {location}
        </p>
      </div>

      {/* Emotion Filter */}
      <div className="glass-morphism rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-purple-300" />
          <h3 className="text-lg font-semibold text-white">
            Filter by Emotion
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedEmotion("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedEmotion === "all"
                ? "bg-white text-purple-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            All Emotions
          </button>

          {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedEmotion === emotion
                  ? "bg-white text-purple-900"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              {EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS]}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism rounded-2xl overflow-hidden"
      >
        <div
          ref={mapRef}
          className="w-full h-96 md:h-[500px] rounded-2xl"
          style={{ minHeight: "400px" }}
        />
      </motion.div>

      {/* Legend */}
      <div className="glass-morphism rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-purple-300" />
          <h3 className="text-lg font-semibold text-white">Legend</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
            <div key={emotion} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-purple-200">
                {EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS]}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-purple-300">
            Circle size represents emotion intensity • Click markers for details
          </p>
        </div>
      </div>
    </div>
  );
}
