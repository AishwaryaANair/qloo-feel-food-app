"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold text-black">vibe check</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 -mt-20">
        <div className="max-w-sm mx-auto w-full text-center">
          <h2 className="text-4xl font-bold text-black mb-4 leading-tight">
            find places that match your mood
          </h2>

          <p className="text-gray-600 mb-12 text-lg">
            simple. honest. no bullsh*t.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push("/mood")}
              className="w-full minimal-button py-4 px-6 text-lg flex items-center justify-center gap-3"
            >
              start vibe check
              <ArrowRight size={20} />
            </button>

            <button
              onClick={() => router.push("/heatmap")}
              className="w-full minimal-button-secondary py-4 px-6 text-lg"
            >
              explore map
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 text-center">
        <p className="text-sm text-gray-400">made for humans who feel things</p>
      </div>
    </div>
  );
}
