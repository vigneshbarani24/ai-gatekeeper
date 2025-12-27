'use client';

import { motion } from 'framer-motion';
import { Shield, Phone, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface VoiceOrbProps {
  status: 'idle' | 'active' | 'blocked' | 'emergency';
  callsBlocked: number;
  timeSaved: number; // minutes
}

const STATUS_CONFIG = {
  idle: {
    color: '#00ffff',
    icon: Shield,
    message: 'Protecting your time',
    pulse: 'slow',
  },
  active: {
    color: '#ffaa00',
    icon: Phone,
    message: 'Screening call...',
    pulse: 'fast',
  },
  blocked: {
    color: '#ff3366',
    icon: AlertTriangle,
    message: 'Scam blocked!',
    pulse: 'medium',
  },
  emergency: {
    color: '#00ff88',
    icon: CheckCircle2,
    message: 'Important call',
    pulse: 'fast',
  },
};

export default function VoiceOrb({ status, callsBlocked, timeSaved }: VoiceOrbProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Main Orb */}
      <motion.div
        className="relative"
        animate={{
          scale: status === 'active' ? [1, 1.05, 1] : 1,
        }}
        transition={{
          duration: config.pulse === 'fast' ? 1 : config.pulse === 'medium' ? 2 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Outer glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-60 animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`,
            width: '400px',
            height: '400px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Middle ring */}
        <motion.div
          className="relative z-10 rounded-full border-2 glass-card"
          style={{
            borderColor: config.color,
            width: '300px',
            height: '300px',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Gradient ring decoration */}
          <div
            className="absolute inset-4 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, ${config.color}, transparent, ${config.color})`,
              opacity: 0.3,
            }}
          />
        </motion.div>

        {/* Inner orb */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full glass-card flex items-center justify-center"
          style={{
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${config.color}20, transparent)`,
            border: `2px solid ${config.color}`,
          }}
          animate={{
            boxShadow: [
              `0 0 20px ${config.color}`,
              `0 0 60px ${config.color}`,
              `0 0 20px ${config.color}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon
            size={80}
            color={config.color}
            strokeWidth={1.5}
            className="drop-shadow-lg"
          />
        </motion.div>
      </motion.div>

      {/* Status message */}
      <motion.div
        className="mt-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-3xl font-bold mb-2" style={{ color: config.color }}>
          {config.message}
        </h2>
        <p className="text-gray-400 text-lg">
          {status === 'idle' && 'All systems operational'}
          {status === 'active' && 'AI is analyzing...'}
          {status === 'blocked' && 'Threat neutralized'}
          {status === 'emergency' && 'Connecting you now'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mt-12 flex gap-8">
        <motion.div
          className="glass-card px-6 py-4 rounded-2xl text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-danger">{callsBlocked}</div>
          <div className="text-sm text-gray-400 mt-1">Scams Blocked</div>
        </motion.div>

        <motion.div
          className="glass-card px-6 py-4 rounded-2xl text-center"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-success">{timeSaved}m</div>
          <div className="text-sm text-gray-400 mt-1">Time Saved</div>
        </motion.div>
      </div>
    </div>
  );
}
