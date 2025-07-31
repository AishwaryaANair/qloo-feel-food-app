"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [peopleCount, setPeopleCount] = useState(137);

  useEffect(() => {
    setPeopleCount(Math.floor(Math.random() * (200 - 50 + 1)) + 50);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 text-slate-50">
      {/* Background Glow */}
      <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-cyan-500/10 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-1/2 -right-1/4 w-3/4 h-3/4 bg-fuchsia-500/10 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>

      <div className="relative flex flex-col items-center justify-center min-h-screen px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-3 text-white shadow-lg">
            Vibe Check
          </h1>
          <p className="text-lg text-slate-300 mb-10">
            Find a place that gets you.
          </p>

          <motion.button
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 25px rgba(0, 255, 255, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/mood")}
            className="group w-full max-w-sm mx-auto py-4 px-6 bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md text-white rounded-xl font-semibold text-lg hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            Let's find a vibe
            <ArrowRight
              className="transition-transform group-hover:translate-x-1"
              size={20}
            />
          </motion.button>

          <p className="text-sm text-slate-400 mt-6 opacity-80">
            {peopleCount} people finding their vibe nearby
          </p>
        </motion.div>
      </div>
    </div>
  );
}
