// src/app/components/VibeHeatmap.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Palette, Filter, AlertTriangle } from "lucide-react";
import { db } from "../../lib/firebase"; // Import the Firestore instance
import { collection, getDocs, query, where } from "firebase/firestore";

// --- Type Definitions ---
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
  city: string;
}

interface VibeHeatmapProps {
  location?: string;
}

// --- Constants ---
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

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script";

// --- Main Component ---
export default function VibeHeatmap({
  location = "San Francisco, CA",
}: VibeHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapPlace[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // --- Effect 1: Load Google Maps Script ---
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsScriptLoaded(true);
      return;
    }

    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      setError(
        "Failed to load Google Maps script. Please check your API key and network connection.",
      );
    };

    document.head.appendChild(script);
  }, []);

  // --- Effect 2: Initialize Map when Script is Loaded and Ref is available ---
  useEffect(() => {
    if (isScriptLoaded && mapRef.current && !map) {
      const initializeMap = async () => {
        try {
          const { Map } = (await google.maps.importLibrary(
            "maps",
          )) as google.maps.MapsLibrary;

          const mapInstance = new Map(mapRef.current!, {
            center: { lat: 37.7749, lng: -122.4194 },
            zoom: 13,
            mapId: "VIBE_MAP_STYLE",
            styles: [
              {
                featureType: "all",
                elementType: "labels.text.fill",
                stylers: [
                  { saturation: 36 },
                  { color: "#333333" },
                  { lightness: 40 },
                ],
              },
              {
                featureType: "all",
                elementType: "labels.text.stroke",
                stylers: [
                  { visibility: "on" },
                  { color: "#ffffff" },
                  { lightness: 16 },
                ],
              },
              {
                featureType: "all",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
              },
              {
                featureType: "administrative",
                elementType: "geometry.fill",
                stylers: [{ color: "#fefefe" }, { lightness: 20 }],
              },
              {
                featureType: "administrative",
                elementType: "geometry.stroke",
                stylers: [
                  { color: "#fefefe" },
                  { lightness: 17 },
                  { weight: 1.2 },
                ],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }, { lightness: 20 }],
              },
              {
                featureType: "poi",
                elementType: "geometry",
                stylers: [{ color: "#f5f5f5" }, { lightness: 21 }],
              },
              {
                featureType: "poi.park",
                elementType: "geometry",
                stylers: [{ color: "#dedede" }, { lightness: 21 }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.fill",
                stylers: [{ color: "#ffffff" }, { lightness: 17 }],
              },
              {
                featureType: "road.highway",
                elementType: "geometry.stroke",
                stylers: [
                  { color: "#ffffff" },
                  { lightness: 29 },
                  { weight: 0.2 },
                ],
              },
              {
                featureType: "road.arterial",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }, { lightness: 18 }],
              },
              {
                featureType: "road.local",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }, { lightness: 16 }],
              },
              {
                featureType: "transit",
                elementType: "geometry",
                stylers: [{ color: "#f2f2f2" }, { lightness: 19 }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#e9e9e9" }, { lightness: 17 }],
              },
            ],
          });
          setMap(mapInstance);
        } catch (e) {
          setError("Could not load Google Maps.");
          console.error("Error in initializeMap:", e);
        }
      };

      initializeMap();
    }
  }, [isScriptLoaded, map]);

  // --- Fetch Heatmap Data from Firestore ---
  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!db) {
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const placesCollection = collection(db, "vibe_places");
        const q = query(placesCollection, where("city", "==", location));

        const querySnapshot = await getDocs(q);
        const places: HeatmapPlace[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const placeLocation =
            data.location &&
            typeof data.location.latitude === "number" &&
            typeof data.location.longitude === "number"
              ? { lat: data.location.latitude, lng: data.location.longitude }
              : { lat: 37.7749, lng: -122.4194 };

          places.push({
            place_id: doc.id,
            name: data.name || "Unnamed Place",
            location: placeLocation,
            emotions: data.emotions || {},
            dominant_emotion: data.dominant_emotion || "happy",
            rating: data.rating || 0,
            types: data.types || [],
            city: data.city || "Unknown City",
          } as HeatmapPlace);
        });

        setHeatmapData(places);
      } catch (err: any) {
        setError(
          "Failed to fetch data from Firestore. Check your connection, Firebase setup, and Firestore rules.",
        );
        console.error("Firestore error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeatmapData();
  }, [location]);

  // --- Update Map Markers ---
  useEffect(() => {
    if (!map || !window.google) {
      return;
    }

    const updateMarkers = async () => {
      try {
        const { Marker } = (await google.maps.importLibrary(
          "marker",
        )) as google.maps.MarkerLibrary;
        const { InfoWindow } = (await google.maps.importLibrary(
          "maps",
        )) as google.maps.MapsLibrary;

        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        const filteredData =
          selectedEmotion === "all"
            ? heatmapData
            : heatmapData.filter(
                (place) => place.dominant_emotion === selectedEmotion,
              );

        filteredData.forEach((place) => {
          const emotionColor =
            EMOTION_COLORS[
              place.dominant_emotion as keyof typeof EMOTION_COLORS
            ] || "#6b7280";
          const intensity = place.emotions[place.dominant_emotion] || 0.5;

          const marker = new Marker({
            position: place.location,
            map: map,
            title: place.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8 + intensity * 12,
              fillColor: emotionColor,
              fillOpacity: 0.7,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });

          const infoWindow = new InfoWindow({
            content: `
                <div style="background-color: white; color: black; padding: 12px; border-radius: 8px; font-family: sans-serif; max-width: 200px; border: 1px solid #e5e7eb;">
                    <h3 style="font-weight: bold; font-size: 16px; margin: 0 0 8px;">${place.name}</h3>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${emotionColor};"></div>
                    <span style="font-size: 14px;">${EMOTION_LABELS[place.dominant_emotion as keyof typeof EMOTION_LABELS]}</span>
                    </div>
                    <div style="font-size: 12px; color: #4b5563;">
                    <p style="margin: 0;">Rating: ${place.rating}/5</p>
                    <p style="margin: 0;">Intensity: ${Math.round(intensity * 100)}%</p>
                    </div>
                </div>
                `,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
          markersRef.current.push(marker);
        });

        if (filteredData.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          filteredData.forEach((place) => {
            bounds.extend(place.location);
          });
          map.fitBounds(bounds);
        }
      } catch (e) {
        console.error("Error updating markers:", e);
        setError("There was an issue displaying places on the map.");
      }
    };

    updateMarkers();
  }, [map, heatmapData, selectedEmotion]);

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 minimal-card">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-black">Loading vibe heatmap...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96 minimal-card p-4">
          <div className="text-center text-red-600">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
            <p className="font-semibold">Could not load data</p>
            <p className="text-sm text-gray-600 mt-2">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="minimal-card overflow-hidden"
      >
        <div
          ref={mapRef}
          className="w-full h-96 md:h-[500px]"
          style={{ minHeight: "400px" }}
        />
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Emotion Filter */}
      <div className="minimal-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-black">Filter by Vibe</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedEmotion("all")}
            className={
              selectedEmotion === "all"
                ? "minimal-button px-4 py-2 text-sm"
                : "minimal-button-secondary px-4 py-2 text-sm"
            }
          >
            All Vibes
          </button>
          {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion)}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                selectedEmotion === emotion
                  ? "minimal-button"
                  : "minimal-button-secondary"
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
      {renderContent()}

      {/* Legend */}
      <div className="minimal-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-black">Legend</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(EMOTION_COLORS).map(([emotion, color]) => (
            <div key={emotion} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-600">
                {EMOTION_LABELS[emotion as keyof typeof EMOTION_LABELS]}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Circle size represents emotion intensity • Click markers for details
          </p>
        </div>
      </div>
    </div>
  );
}
