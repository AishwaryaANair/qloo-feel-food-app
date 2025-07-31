"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Loader,
  CheckCircle,
  Heart,
  Sparkles,
} from "lucide-react";

interface VibeCheckProps {
  mood: string;
  placeType: string;
  placeName: string;
}

interface VibeResponse {
  question: string;
  response?: string;
  timestamp: number;
}

export default function VibeCheck({
  mood,
  placeType,
  placeName,
}: VibeCheckProps) {
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [responses, setResponses] = useState<VibeResponse[]>([]);
  const [userResponse, setUserResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Core vibe check questions
  const coreQuestions = [
    {
      id: "vibe_match",
      text: `Does the vibe at ${placeName} still match your ${mood} mood?`,
      type: "boolean",
    },
    {
      id: "one_word",
      text: `Describe ${placeName} in one word:`,
      type: "text",
    },
  ];

  const handleGetAIQuestion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/api/vibe/question?mood=${encodeURIComponent(mood.toLowerCase())}&place_type=${encodeURIComponent(placeType)}&place_name=${encodeURIComponent(placeName)}`,
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Could not get a question.");
      }

      const data = await response.json();
      setCurrentQuestion(data.vibe_question);
      setIsExpanded(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoreQuestion = (question: (typeof coreQuestions)[0]) => {
    setCurrentQuestion(question.text);
    setIsExpanded(true);
  };

  const handleSubmitResponse = () => {
    if (!userResponse.trim() || !currentQuestion) return;

    const newResponse: VibeResponse = {
      question: currentQuestion,
      response: userResponse,
      timestamp: Date.now(),
    };

    setResponses((prev) => [...prev, newResponse]);
    setUserResponse("");
    setCurrentQuestion(null);
  };

  const handleQuickResponse = (response: string) => {
    if (!currentQuestion) return;

    const newResponse: VibeResponse = {
      question: currentQuestion,
      response: response,
      timestamp: Date.now(),
    };

    setResponses((prev) => [...prev, newResponse]);
    setCurrentQuestion(null);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setCurrentQuestion(null);
      setUserResponse("");
    }
  };

  return (
    <div className="mt-auto pt-4 border-t border-white/10">
      {/* Response History */}
      <AnimatePresence>
        {responses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2"
          >
            {responses.slice(-2).map((response, index) => (
              <div
                key={response.timestamp}
                className="bg-green-500/20 p-3 rounded-lg"
              >
                <p className="text-green-100 text-xs mb-1 italic">
                  "{response.question}"
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-400" />
                  <p className="text-green-200 text-sm font-medium">
                    {response.response}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Question */}
      <AnimatePresence>
        {currentQuestion && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-4"
          >
            <div className="bg-purple-500/20 p-4 rounded-lg">
              <div className="flex items-start gap-2 mb-3">
                <Sparkles size={16} className="text-purple-300 mt-0.5" />
                <p className="text-purple-100 italic">"{currentQuestion}"</p>
              </div>

              {/* Quick Response Buttons for Boolean Questions */}
              {(currentQuestion.toLowerCase().includes("does") ||
                currentQuestion.toLowerCase().includes("is") ||
                currentQuestion.toLowerCase().includes("match")) && (
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleQuickResponse("Yes")}
                    className="px-4 py-2 bg-green-500/30 text-green-200 rounded-lg text-sm hover:bg-green-500/40 transition-colors"
                  >
                    <Heart size={14} className="inline mr-1" />
                    Yes
                  </button>
                  <button
                    onClick={() => handleQuickResponse("Not really")}
                    className="px-4 py-2 bg-red-500/30 text-red-200 rounded-lg text-sm hover:bg-red-500/40 transition-colors"
                  >
                    Not really
                  </button>
                  <button
                    onClick={() => handleQuickResponse("Somewhat")}
                    className="px-4 py-2 bg-yellow-500/30 text-yellow-200 rounded-lg text-sm hover:bg-yellow-500/40 transition-colors"
                  >
                    Somewhat
                  </button>
                </div>
              )}

              {/* Text Input for Open-ended Questions */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Your response..."
                  className="flex-1 px-3 py-2 bg-white/10 text-white placeholder-white/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSubmitResponse()
                  }
                />
                <button
                  onClick={handleSubmitResponse}
                  disabled={!userResponse.trim()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-red-400 text-xs text-center mb-2">{error}</p>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {!isExpanded ? (
          <>
            {/* Core Questions */}
            <div className="grid grid-cols-2 gap-2">
              {coreQuestions.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleCoreQuestion(question)}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                >
                  <MessageSquare size={14} />
                  <span className="truncate">
                    {question.id === "vibe_match"
                      ? "Still Vibing?"
                      : "One Word"}
                  </span>
                </button>
              ))}
            </div>

            {/* AI Question Button */}
            <button
              onClick={handleGetAIQuestion}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white rounded-lg font-semibold hover:from-purple-500/30 hover:to-pink-500/30 transition-all border border-purple-500/30"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={18} />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>AI Vibe Question</span>
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={toggleExpanded}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
          >
            <MessageSquare size={18} />
            <span>Close Vibe Check</span>
          </button>
        )}
      </div>

      {/* Stats */}
      {responses.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-purple-300 text-center">
            {responses.length} vibe check{responses.length !== 1 ? "s" : ""}{" "}
            completed
          </p>
        </div>
      )}
    </div>
  );
}
