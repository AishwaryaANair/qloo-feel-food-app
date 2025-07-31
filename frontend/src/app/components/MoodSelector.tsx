"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import * as Slider from "@radix-ui/react-slider";

interface MoodSelectorProps {
  onMoodSelect: (mood: MoodData) => void;
}

interface MoodData {
  primary_mood: string;
  intensity: number;
  context?: string;
  time_preference?: string;
}

const MOODS = [
  {
    id: "anxious",
    label: "Anxious",
    emoji: "😰",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "lonely",
    label: "Lonely",
    emoji: "🥺",
    color: "from-blue-400 to-indigo-600",
  },
  {
    id: "celebratory",
    label: "Celebratory",
    emoji: "🎉",
    color: "from-pink-400 to-red-500",
  },
  {
    id: "nostalgic",
    label: "Nostalgic",
    emoji: "🌅",
    color: "from-purple-400 to-pink-600",
  },
  {
    id: "stressed",
    label: "Stressed",
    emoji: "😵‍💫",
    color: "from-red-400 to-red-600",
  },
  {
    id: "contemplative",
    label: "Contemplative",
    emoji: "🤔",
    color: "from-teal-400 to-blue-600",
  },
  // TODO: Add more moods
];

const CONTEXTS = [
  "Just need comfort",
  "Work stress",
  "Relationship stuff",
  "Existential thoughts",
  "Missing home",
  "Celebrating alone",
  // TODO: Add more contexts
];

export default function MoodSelector({ onMoodSelect }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [intensity, setIntensity] = useState<number[]>([5]);
  const [context, setContext] = useState<string>("");
  const [showContexts, setShowContexts] = useState(false);

  const handleSubmit = () => {
    if (selectedMood) {
      onMoodSelect({
        primary_mood: selectedMood,
        intensity: intensity[0],
        context: context || undefined,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">
        How are you feeling right now?
      </h2>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {MOODS.map((mood) => (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedMood(mood.id);
              setShowContexts(true);
            }}
            className={`p-6 rounded-2xl bg-gradient-to-br ${
              selectedMood === mood.id
                ? mood.color
                : "from-gray-600 to-gray-700"
            } transition-all duration-300`}
          >
            <div className="text-4xl mb-2">{mood.emoji}</div>
            <div className="text-white font-medium">{mood.label}</div>
          </motion.button>
        ))}
      </div>

      {/* Intensity Slider */}
      {selectedMood && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <label className="text-white text-lg mb-4 block">
            How intense is this feeling?
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={intensity}
            onValueChange={setIntensity}
            max={10}
            min={1}
            step={1}
          >
            <Slider.Track className="bg-white/20 relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-white rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-5 h-5 bg-white rounded-full shadow-lg hover:shadow-xl focus:outline-none"
              aria-label="Intensity"
            />
          </Slider.Root>
          <div className="flex justify-between mt-2 text-sm text-white/60">
            <span>Mild</span>
            <span>Intense</span>
          </div>
        </motion.div>
      )}

      {/* Context Options */}
      {showContexts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <label className="text-white text-lg mb-4 block">
            Want to share what's behind it? (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {CONTEXTS.map((ctx) => (
              <button
                key={ctx}
                onClick={() => setContext(ctx)}
                className={`p-3 rounded-lg text-sm transition-all ${
                  context === ctx
                    ? "bg-white text-purple-900"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {ctx}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      {selectedMood && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full py-4 bg-white text-purple-900 rounded-xl font-semibold text-lg hover:bg-purple-100 transition-colors"
        >
          Find my comfort zone
        </motion.button>
      )}
    </div>
  );
}
