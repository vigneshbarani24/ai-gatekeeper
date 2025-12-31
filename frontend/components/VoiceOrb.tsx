'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Phone, AlertTriangle, CheckCircle2, Mic } from 'lucide-react';

interface VoiceOrbProps {
  status: 'idle' | 'active' | 'blocked' | 'emergency';
  callsBlocked: number;
  timeSaved: number; // minutes
}

const STATUS_CONFIG = {
  idle: {
    baseColor: 'rgba(255, 140, 104, 0.4)',
    accentColor: 'rgba(255, 92, 51, 0.6)',
    glowColor: 'rgba(255, 140, 104, 0.15)',
    icon: Shield,
    message: 'Protecting your silence',
    description: 'AI Gatekeeper is active and vigilant',
  },
  active: {
    baseColor: 'rgba(52, 199, 89, 0.4)',
    accentColor: 'rgba(48, 209, 88, 0.6)',
    glowColor: 'rgba(52, 199, 89, 0.15)',
    icon: Phone,
    message: 'Screening live call',
    description: 'Analyzing intent and sentiment...',
  },
  blocked: {
    baseColor: 'rgba(255, 59, 48, 0.4)',
    accentColor: 'rgba(255, 69, 58, 0.6)',
    glowColor: 'rgba(255, 59, 48, 0.15)',
    icon: AlertTriangle,
    message: 'Threat neutralized',
    description: 'Suspicious call blocked automatically',
  },
  emergency: {
    baseColor: 'rgba(0, 122, 255, 0.4)',
    accentColor: 'rgba(10, 132, 255, 0.6)',
    glowColor: 'rgba(0, 122, 255, 0.15)',
    icon: Mic,
    message: 'Priority call',
    description: 'Connecting you with verification',
  },
};

export default function VoiceOrb({ status, callsBlocked, timeSaved }: VoiceOrbProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 relative">
      {/* Background Atmosphere */}
      <div
        className="absolute inset-0 blur-[120px] rounded-full pointer-events-none transition-all duration-1000"
        style={{ background: config.glowColor, scale: 0.8 }}
      />

      {/* Main Orb Container */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Organic Liquid Layers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Layer 1: The Deep Base */}
            <motion.div
              animate={{
                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                rotate: [0, 120, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-4 blur-sm opacity-40 shadow-[inset_0_0_40px_rgba(255,255,255,0.1)]"
              style={{ background: config.baseColor }}
            />

            {/* Layer 2: The Pulsing Energy */}
            <motion.div
              animate={{
                borderRadius: ["50% 50% 30% 70% / 50% 30% 70% 50%", "30% 70% 50% 50% / 70% 50% 50% 30%", "50% 50% 30% 70% / 50% 30% 70% 50%"],
                rotate: [0, -90, 0],
                scale: status === 'active' ? [1, 1.05, 1] : [1, 1.02, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-8 mix-blend-overlay opacity-60"
              style={{ background: config.accentColor }}
            />

            {/* Layer 3: Inner Core Glass */}
            <div className="absolute inset-16 rounded-full glass-card flex items-center justify-center border-t border-white/20 shadow-2xl backdrop-blur-3xl overflow-hidden">
              {/* Surface Reflections */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <motion.div
                animate={{ x: [-100, 200] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-x-20 -inset-y-full skew-x-[30deg] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
              />

              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10"
              >
                <Icon size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Outer Floating Rings (Wait - delicate animation) */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border border-white/5 rounded-full pointer-events-none"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1 + i * 0.1, 1],
              opacity: [0.1, 0.05, 0.1],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ margin: -i * 12 }}
          />
        ))}
      </div>

      {/* Dynamic Status Text */}
      <div className="mt-16 text-center space-y-2">
        <motion.h2
          key={status + 'title'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-black title-premium"
        >
          {config.message}
        </motion.h2>
        <motion.p
          key={status + 'desc'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 font-medium tracking-wide max-w-xs mx-auto"
        >
          {config.description}
        </motion.p>
      </div>

      {/* Floating Micro-Stats */}
      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-md px-4">
        <motion.div
          className="premium-card p-4 flex items-center gap-4 group"
          whileHover={{ y: -4 }}
        >
          <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error group-hover:bg-error/20 transition-colors">
            <Shield size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-white">{callsBlocked}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Blocks</div>
          </div>
        </motion.div>

        <motion.div
          className="premium-card p-4 flex items-center gap-4 group"
          whileHover={{ y: -4 }}
        >
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success group-hover:bg-success/20 transition-colors">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="text-xl font-black text-white">{timeSaved}m</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saved</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
