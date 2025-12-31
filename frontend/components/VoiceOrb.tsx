'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Phone,
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  Loader2,
  Zap,
  Radio
} from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import { useCallback, useState } from 'react';

interface VoiceOrbProps {
  status: 'idle' | 'active' | 'blocked' | 'emergency';
  callsBlocked: number;
  timeSaved: number; // minutes
}

const STATUS_CONFIG = {
  idle: {
    baseColor: 'rgba(99, 102, 241, 0.4)', // Indigo
    accentColor: 'rgba(168, 85, 247, 0.5)', // Purple
    glowColor: 'rgba(99, 102, 241, 0.1)',
    icon: ShieldCheck,
    message: 'Gatekeeper Active',
    description: 'Securing your communication channels',
  },
  active: {
    baseColor: 'rgba(16, 185, 129, 0.4)', // Emerald
    accentColor: 'rgba(5, 150, 105, 0.6)',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    icon: Phone,
    message: 'Screening live call',
    description: 'Analyzing caller intent...',
  },
  blocked: {
    baseColor: 'rgba(244, 63, 94, 0.4)', // Rose
    accentColor: 'rgba(225, 29, 72, 0.6)',
    glowColor: 'rgba(244, 63, 94, 0.1)',
    icon: AlertCircle,
    message: 'Threat neutralized',
    description: 'Suspicious connection blocked',
  },
  emergency: {
    baseColor: 'rgba(14, 165, 233, 0.4)', // Sky
    accentColor: 'rgba(2, 132, 199, 0.6)',
    glowColor: 'rgba(14, 165, 233, 0.1)',
    icon: Radio,
    message: 'Priority call',
    description: 'Awaiting your verification',
  },
};

export default function VoiceOrb({ status: initialStatus, callsBlocked, timeSaved }: VoiceOrbProps) {
  const conversation = useConversation();
  const [isConnecting, setIsConnecting] = useState(false);

  const startConversation = useCallback(async () => {
    try {
      setIsConnecting(true);
      await navigator.mediaDevices.getUserMedia({ audio: true });

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'demo_agent_id',
        connectionType: 'webrtc',
      });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to access microphone or connect to AI agent.');
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isActive = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  const effectiveStatus = isActive ? 'active' : initialStatus;
  const config = STATUS_CONFIG[effectiveStatus];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 relative overflow-hidden">
      {/* Dynamic Aura */}
      <div
        className="absolute w-[800px] h-[800px] blur-[160px] rounded-full pointer-events-none transition-all duration-1000 opacity-20"
        style={{
          background: isActive ? 'rgba(16, 185, 129, 0.4)' : config.glowColor,
          scale: isActive && isSpeaking ? 1.5 : 1,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Liquid Orb Viewport */}
      <div className="relative w-[440px] h-[440px] flex items-center justify-center mb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveStatus + (isSpeaking ? '-speaking' : '')}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Liquid Background Layers */}
            <motion.div
              animate={{
                borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 30% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
                rotate: [0, 180, 360],
                scale: isSpeaking ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 blur-[4px] opacity-20"
              style={{ background: isActive ? 'rgba(16, 185, 129, 0.6)' : config.baseColor }}
            />

            <motion.div
              animate={{
                borderRadius: ["30% 60% 70% 30% / 50% 60% 30% 60%", "60% 40% 30% 70% / 60% 30% 70% 40%", "30% 60% 70% 30% / 50% 60% 30% 60%"],
                rotate: [360, 180, 0],
                scale: isActive ? 1.15 : 1.05,
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-10 opacity-30 mix-blend-plus-lighter"
              style={{ background: isActive ? 'rgba(52, 211, 153, 0.4)' : config.accentColor }}
            />

            {/* Solid Glass Center */}
            <div className="relative z-10 w-44 h-44 glass-card flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden rounded-[4rem]">
              <motion.div
                animate={{ x: [-200, 300], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-white/5 skew-x-12 pointer-events-none"
              />
              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.15, 1] : 1,
                  filter: isSpeaking ? 'drop-shadow(0 0 15px rgba(255,255,255,0.4))' : 'none'
                }}
              >
                {isActive ? (
                  <Mic size={56} className="text-white" />
                ) : (
                  <Icon size={56} className="text-white" />
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Outer Orbital Rings */}
        <div className="absolute inset-0 border border-white/5 rounded-full scale-[1.1] opacity-20" />
        <div className="absolute inset-0 border border-white/[0.02] rounded-full scale-[1.2] opacity-10" />
      </div>

      {/* Info & Status Area */}
      <div className="text-center space-y-8 max-w-sm w-full relative z-20">
        <div className="space-y-2">
          <motion.h2
            key={effectiveStatus + 'title'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white tracking-tight"
          >
            {isActive ? (isSpeaking ? 'Listening...' : 'Thinking...') : config.message}
          </motion.h2>
          <motion.p
            key={effectiveStatus + 'desc'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 font-semibold text-lg leading-relaxed"
          >
            {isActive ? 'Talk freely with Gatekeeper AI' : config.description}
          </motion.p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {!isActive ? (
              <motion.button
                key="start-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startConversation}
                disabled={isConnecting}
                className="btn-premium px-12 py-4 text-lg w-full shadow-2xl"
              >
                {isConnecting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <Mic size={24} />
                )}
                {isConnecting ? 'Initializing...' : 'Talk to AI Agent'}
              </motion.button>
            ) : (
              <motion.button
                key="stop-btn"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={stopConversation}
                className="px-12 py-4 rounded-2xl bg-white/5 text-rose-400 border border-rose-500/20 font-black text-lg flex items-center justify-center gap-3 hover:bg-rose-500/10 transition-all w-full shadow-xl"
              >
                <MicOff size={24} />
                End Conversation
              </motion.button>
            )}
          </AnimatePresence>

          {isActive && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-black text-emerald-500">
                Encrypted Real-time link
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Access Stats Row */}
      <div className="mt-20 flex gap-8">
        <div className="text-center group cursor-default">
          <div className="text-3xl font-black text-white group-hover:text-primary-start transition-colors">{callsBlocked}</div>
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Neutralized</div>
        </div>
        <div className="w-px h-10 bg-white/5" />
        <div className="text-center group cursor-default">
          <div className="text-3xl font-black text-white group-hover:text-primary-start transition-colors">{timeSaved}m</div>
          <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Reclaimed</div>
        </div>
      </div>
    </div>
  );
}
