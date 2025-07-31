"use client";

import { Place } from "@/types";
import { motion } from "framer-motion";
import { MapPin, Star } from "lucide-react";
import VibeCheck from "./VibeCheck";

interface RecommendationCardProps {
  place: Place;
}

export default function RecommendationCard({ place }: RecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg overflow-hidden flex flex-col"
    >
      <img
        src={place.thumbnail}
        alt={place.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            `https://placehold.co/600x400/3730a3/ffffff?text=Image+Not+Found`;
        }}
      />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-white mb-2">{place.name}</h3>
        <div className="flex items-center gap-4 text-sm text-purple-300 mb-4">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{place.type}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} />
            <span>{place.rating}</span>
          </div>
        </div>
        <p className="text-purple-200 mb-6 text-sm flex-grow">
          {place.emotional_description}
        </p>

        <VibeCheck mood={place.tags[0]} placeType={place.type} />
      </div>
    </motion.div>
  );
}
