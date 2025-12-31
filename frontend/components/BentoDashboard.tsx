"use client";

import { motion } from "framer-motion";
import { Shield, Clock, Phone, Ban, TrendingUp, CheckCircle, ArrowUpRight } from "lucide-react";

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
  const blockRatePercent = Math.round(stats.block_rate * 100);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Main Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-8 premium-card p-8 group relative"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-primary-start uppercase tracking-[0.2em]">Total Coverage</span>
                <h3 className="text-6xl font-black title-premium leading-none">
                  {stats.total_calls.toLocaleString()}
                </h3>
                <p className="text-gray-500 text-sm font-medium pt-2">Total calls analyzed by Gatekeeper AI</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-primary-start/5 border border-primary-start/10 flex items-center justify-center text-primary-start shadow-[0_0_20px_rgba(255,140,104,0.1)]">
                <Phone size={32} />
              </div>
            </div>

            <div className="mt-auto grid grid-cols-3 gap-8 pt-12">
              <div className="space-y-1 border-l border-white/5 pl-4">
                <div className="text-2xl font-black text-white">{stats.today_calls}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Today</div>
              </div>
              <div className="space-y-1 border-l border-white/5 pl-4">
                <div className="text-2xl font-black text-white">{stats.avg_call_duration}s</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Avg Dur</div>
              </div>
              <div className="space-y-1 border-l border-white/5 pl-4">
                <div className="text-2xl font-black text-success">{blockRatePercent}%</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Subtle Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-start/5 blur-[100px] rounded-full pointer-events-none" />
        </motion.div>

        {/* Secondary Metrics Column */}
        <div className="md:col-span-4 grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-3xl relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error">
                <Ban size={24} />
              </div>
              <ArrowUpRight size={20} className="text-gray-600 group-hover:text-error transition-colors" />
            </div>
            <div className="text-3xl font-black text-white">{stats.scams_blocked}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Spam Blocked</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-3xl relative overflow-hidden group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
                <Clock size={24} />
              </div>
              <ArrowUpRight size={20} className="text-gray-600 group-hover:text-warning transition-colors" />
            </div>
            <div className="text-3xl font-black text-white">{Math.round(stats.time_saved_minutes / 60)}h {stats.time_saved_minutes % 60}m</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Focus Time Reclaimed</div>
          </motion.div>
        </div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-12 glass-card p-6 rounded-full flex items-center justify-between px-10 border border-white/5"
        >
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-success rounded-full shadow-[0_0_12px_rgba(52,199,89,0.5)] animate-pulse" />
            <span className="text-xs font-bold text-gray-300 tracking-wider">GATEKEEPER ENGINE STANDING BY</span>
          </div>
          <div className="hidden md:flex gap-8">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-primary-start" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-primary-start" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
