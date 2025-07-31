"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Loader, AlertTriangle } from "lucide-react";

interface VibeCheckProps {
  mood: string;
  placeType: string;
}

export default function VibeCheck({ mood, placeType }: VibeCheckProps) {
  const [question, setQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetQuestion = async () => {
    if (question) {
      // Allow toggling the question off
      setQuestion(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:8000/api/vibe/question?mood=${encodeURIComponent(mood.toLowerCase())}&place_type=${encodeURIComponent(placeType)}`,
      );
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Could not get a question.");
      }
      const data = await response.json();
      setQuestion(data.vibe_question);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-auto pt-4 border-t border-white/10">
      {question && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-purple-500/20 p-4 rounded-lg mb-4 text-center"
        >
          <p className="text-purple-100 italic">"{question}"</p>
        </motion.div>
      )}
      {error && (
        <p className="text-red-400 text-xs text-center mb-2">{error}</p>
      )}
      <motion.button
        onClick={handleGetQuestion}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
      >
        {isLoading ? (
          <Loader className="animate-spin" size={20} />
        ) : (
          <>
            <MessageSquare size={18} />
            <span>{question ? "Hide Vibe Check" : "Vibe Check"}</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
