"use client";

import { useState } from "react";
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
  { id: "anxious", label: "anxious" },
  { id: "lonely", label: "lonely" },
  { id: "celebratory", label: "celebratory" },
  { id: "nostalgic", label: "nostalgic" },
  { id: "stressed", label: "stressed" },
  { id: "contemplative", label: "contemplative" },
  { id: "energetic", label: "energetic" },
  { id: "melancholic", label: "melancholic" },
];

const CONTEXTS = [
  "just need comfort",
  "work stress",
  "relationship stuff",
  "missing home",
  "celebrating alone",
  "existential thoughts",
];

export default function MoodSelector({ onMoodSelect }: MoodSelectorProps) {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [intensity, setIntensity] = useState<number[]>([5]);
  const [context, setContext] = useState<string>("");

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
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-black mb-2">
            how are you feeling?
          </h1>
          <p className="text-gray-600">
            be honest. we'll find places that get it.
          </p>
        </div>

        {/* Mood Selection */}
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                className={`p-4 rounded-xl text-left transition-colors ${
                  selectedMood === mood.id
                    ? "bg-black text-white"
                    : "bg-gray-50 text-black hover:bg-gray-100"
                }`}
              >
                <span className="font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Slider */}
        {selectedMood && (
          <div className="mb-8">
            <label className="block text-black font-medium mb-4">
              how intense? ({intensity[0]}/10)
            </label>
            <div className="px-2">
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-6"
                value={intensity}
                onValueChange={setIntensity}
                max={10}
                min={1}
                step={1}
              >
                <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
                  <Slider.Range className="absolute bg-black rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb
                  className="block w-6 h-6 bg-black rounded-full shadow-sm hover:shadow-md focus:outline-none border-2 border-white"
                  aria-label="Intensity"
                />
              </Slider.Root>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>barely</span>
              <span>intensely</span>
            </div>
          </div>
        )}

        {/* Context */}
        {selectedMood && (
          <div className="mb-12">
            <label className="block text-black font-medium mb-4">
              what's behind it? (optional)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {CONTEXTS.map((ctx) => (
                <button
                  key={ctx}
                  onClick={() => setContext(ctx)}
                  className={`p-3 rounded-lg text-left text-sm transition-colors ${
                    context === ctx
                      ? "bg-black text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {ctx}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        {selectedMood && (
          <button
            onClick={handleSubmit}
            className="w-full minimal-button py-4 px-6 text-lg"
          >
            find my vibe
          </button>
        )}
      </div>
    </div>
  );
}
