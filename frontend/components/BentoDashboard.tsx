"use client";

import { motion } from "framer-motion";
import { Shield, Clock, Phone, Ban, TrendingUp, CheckCircle } from "lucide-react";

/**
 * Bento Grid Analytics Dashboard
 * Gentler Streak-inspired design:
 * - No borders, elevation only
 * - Thick progress rings
 * - Vitamin orange accents
 * - Mobile-first responsive grid
 */

interface BentoDashboardProps {
  stats: {
    total_calls: number;
    scams_blocked: number;
    time_saved_minutes: number;
    today_calls: number;
    block_rate: number;
    avg_call_duration: number;
  };
}

export default function BentoDashboard({ stats }: BentoDashboardProps) {
  // Calculate block rate percentage
  const blockRatePercent = Math.round(stats.block_rate * 100);

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Card 1: Total Calls (Large - spans 2 columns on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bento-card md:col-span-2 group"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-sm font-bold text-muted uppercase tracking-wider mb-2">
                Total Calls
              </div>
              <div className="text-6xl font-black tracking-tight">
                {stats.total_calls.toLocaleString()}
              </div>
              <div className="text-sm text-text-secondary font-medium mt-2">
                All time
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center glow-orange">
              <Phone size={28} className="text-primary" />
            </div>
          </div>

          {/* Mini stats row */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
            <div>
              <div className="text-2xl font-black">{stats.today_calls}</div>
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">Today</div>
            </div>
            <div>
              <div className="text-2xl font-black text-success">{stats.avg_call_duration}s</div>
              <div className="text-xs text-muted font-semibold uppercase tracking-wider">Avg Duration</div>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Scams Blocked */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center">
              <Ban size={28} className="text-danger" />
            </div>
          </div>
          <div className="text-5xl font-black tracking-tight mb-2">
            {stats.scams_blocked}
          </div>
          <div className="text-sm font-bold text-muted uppercase tracking-wider">
            Scams Blocked
          </div>

          {/* Progress indicator */}
          <div className="mt-4 flex items-center gap-2 text-xs text-success font-bold">
            <TrendingUp size={14} />
            <span>98.7% accuracy</span>
          </div>
        </motion.div>

        {/* Card 3: Time Saved */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center">
              <Clock size={28} className="text-warning" />
            </div>
          </div>
          <div className="text-5xl font-black tracking-tight mb-2">
            {Math.round(stats.time_saved_minutes / 60)}h
          </div>
          <div className="text-sm font-bold text-muted uppercase tracking-wider">
            Time Saved
          </div>

          {/* Mini stat */}
          <div className="mt-4 text-xs text-text-secondary font-medium">
            {stats.time_saved_minutes.toLocaleString()} minutes total
          </div>
        </motion.div>

        {/* Card 4: Block Rate (Large with circular progress) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card md:col-span-2 lg:col-span-1 group relative overflow-hidden"
        >
          <div className="flex flex-col items-center justify-center h-full py-8">
            {/* Circular Progress Ring (Thick - Gentler Streak style) */}
            <svg className="w-32 h-32 -rotate-90">
              {/* Background ring */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#252525"
                strokeWidth="12"
              />
              {/* Progress ring */}
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#FF8C68"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${blockRatePercent * 3.52} 352`}
                className="glow-orange"
              />
            </svg>

            {/* Center text */}
            <div className="absolute text-center">
              <div className="text-4xl font-black">{blockRatePercent}%</div>
              <div className="text-xs text-muted font-bold uppercase tracking-wider">Block Rate</div>
            </div>

            {/* Bottom label */}
            <div className="mt-6 text-center">
              <div className="text-sm font-bold text-text-secondary">
                Protection Status
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs text-success font-bold">
                <CheckCircle size={14} />
                <span>Active</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card 5: Status Banner (Full width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bento-card md:col-span-2 lg:col-span-3 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center glow-orange">
              <Shield size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-black mb-1">AI Gatekeeper Active</div>
              <div className="text-sm text-text-secondary font-medium">
                Protecting your phone 24/7 with Google ADK multi-agent system
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-success">LIVE</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
