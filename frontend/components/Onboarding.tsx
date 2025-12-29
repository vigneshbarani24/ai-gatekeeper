"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";

/**
 * Premium Onboarding Component
 * Gentler Streak-inspired design:
 * - Physics-based drag
 * - Vitamin orange accents
 * - Super rounded gummy cards
 * - Mobile-first
 */

// Onboarding steps
const STEPS = [
  {
    id: 1,
    title: "Great Day To Get Protected",
    desc: "AI Gatekeeper answers your phone intelligently, blocking scams in 0.16ms while you focus on what matters.",
    emoji: "🛡️",
    bg: "from-[#1A1A1A] to-[#252525]",
  },
  {
    id: 2,
    title: "Your Voice, Your AI",
    desc: "Clone your voice in 30 seconds. Your AI assistant will sound exactly like you when screening calls.",
    emoji: "🎙️",
    bg: "from-[#1A1A1A] to-[#252525]",
  },
  {
    id: 3,
    title: "473M Deaf Users Empowered",
    desc: "Real-time transcription gives deaf users full phone independence. Never miss an important call again.",
    emoji: "🦻",
    bg: "from-[#1A1A1A] to-[#252525]",
  },
  {
    id: 4,
    title: "Block Scams Instantly",
    desc: "Multi-agent AI (Google ADK + Gemini 2.0) detects IRS scams, tech support fraud, and robocalls before they waste your time.",
    emoji: "⚡",
    bg: "from-[#1A1A1A] to-[#252525]",
  },
];

// Swipe power calculation
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const paginate = (newDirection: number) => {
    if (currentIndex + newDirection < 0 || currentIndex + newDirection >= STEPS.length) return;
    setDirection(newDirection);
    setCurrentIndex(currentIndex + newDirection);
  };

  const handleComplete = () => {
    if (currentIndex === STEPS.length - 1) {
      onComplete();
    } else {
      paginate(1);
    }
  };

  // Slide variants with iOS-like physics
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-between bg-background p-6 text-white">
      {/* Top Bar (Skip) */}
      <div className="flex w-full justify-end py-4">
        {currentIndex < STEPS.length - 1 && (
          <button
            onClick={() => setCurrentIndex(STEPS.length - 1)}
            className="text-sm font-bold text-muted hover:text-white transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Card Area (Swipeable) */}
      <div className="relative flex h-[60vh] w-full max-w-md items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -10000) paginate(1);
              else if (swipe > 10000) paginate(-1);
            }}
            className={`absolute h-full w-full overflow-hidden rounded-4xl bg-gradient-to-br ${STEPS[currentIndex].bg} p-8 shadow-card`}
          >
            {/* Emoji Area (Gummy style) */}
            <div className="flex h-1/2 w-full items-center justify-center">
              <motion.div
                className="flex h-40 w-40 items-center justify-center rounded-full bg-primary/20 text-8xl glow-orange"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {STEPS[currentIndex].emoji}
              </motion.div>
            </div>

            {/* Text Area */}
            <div className="flex h-1/2 flex-col justify-center space-y-4">
              <h2 className="text-4xl font-black tracking-tight leading-[1.1]">
                {STEPS[currentIndex].title}
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed font-medium">
                {STEPS[currentIndex].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="flex w-full max-w-md flex-col items-center space-y-8 pb-safe">
        {/* Pagination Dots (Premium style) */}
        <div className="flex space-x-2">
          {STEPS.map((_, idx) => (
            <motion.div
              key={idx}
              animate={{
                width: idx === currentIndex ? 24 : 8,
                backgroundColor: idx === currentIndex ? "#FF8C68" : "#333",
              }}
              className="h-2 rounded-full"
            />
          ))}
        </div>

        {/* Primary Action Button (Vitamin Orange) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleComplete}
          className="btn-primary flex w-full items-center justify-center text-lg"
        >
          {currentIndex === STEPS.length - 1 ? "Get Started" : "Continue"}
          <ChevronRight size={20} className="ml-2" />
        </motion.button>
      </div>
    </div>
  );
}
