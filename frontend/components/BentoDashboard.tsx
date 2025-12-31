"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Clock,
  Ban,
  ArrowUpRight,
  Zap,
  LayoutDashboard,
  Search,
  Settings,
  Bell,
  Activity,
  User,
  MoreHorizontal
} from "lucide-react";

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
    <div className="w-full max-w-7xl mx-auto px-10 pb-20 pt-10">
      {/* Top Navigation / Header Section - Centered for Wow Factor */}
      <header className="flex flex-col items-center text-center mb-20 gap-8">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <LayoutDashboard size={32} />
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-white tracking-tighter leading-none">Dashboard</h1>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em]">Neural Engine v2.0 Live</p>
            </div>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <button className="px-8 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-black border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all">Overview</button>
          <button className="px-8 py-2.5 rounded-xl text-gray-500 text-xs font-bold hover:text-white transition-all">Call History</button>
          <button className="px-8 py-2.5 rounded-xl text-gray-500 text-xs font-bold hover:text-white transition-all">AI Settings</button>
        </div>
      </header>

      {/* Hero Protection Card - Now Centered & Prominent */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-12 premium-card p-1">
          <div className="bg-background/40 rounded-[1.9rem] p-12 flex flex-col items-center text-center gap-10">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 rounded-[2.5rem] bg-success/10 flex items-center justify-center text-success border border-success/10 shadow-[0_0_60px_rgba(16,185,129,0.15)] relative">
                <ShieldCheck size={48} />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-[-10px] border-2 border-success/20 rounded-[2.8rem]" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-white tracking-tight">Full Protection Active</h2>
                <p className="text-gray-500 font-semibold text-lg max-w-xl mx-auto">Neural Gatekeeper is currently monitoring incoming connections and intercepting high-risk communications automatically. You're set.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="btn-premium px-12 py-4 h-auto text-base">Security Settings</button>
              <button className="btn-secondary px-8 py-4 h-auto text-base">Live Activity</button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Total Usage Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-7 premium-card p-10 flex flex-col justify-between group h-[380px]"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Lifecycle Coverage</span>
              <h3 className="text-7xl font-black title-premium leading-[0.9] -ml-1">
                {stats.total_calls.toLocaleString()}
              </h3>
              <p className="text-gray-500 font-bold text-lg">Detailed analytical scans completed</p>
            </div>
            <button className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-600 hover:text-white transition-all">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/5">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Today</div>
              <div className="text-3xl font-black text-white">{stats.today_calls}</div>
            </div>
            <div className="space-y-1 pl-8 border-l border-white/5">
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Efficiency</div>
              <div className="text-3xl font-black text-primary-start">{blockRatePercent}%</div>
            </div>
            <div className="space-y-1 pl-8 border-l border-white/5">
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Latency</div>
              <div className="text-3xl font-black text-white">{stats.avg_call_duration}s</div>
            </div>
          </div>
        </motion.div>

        {/* Secondary Metrics */}
        <div className="md:col-span-5 grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8 flex items-center justify-between group"
          >
            <div className="space-y-2">
              <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Scams Blocked</div>
              <div className="text-5xl font-black text-white leading-none">{stats.scams_blocked}</div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/10">
              <Ban size={28} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-8 flex items-center justify-between group bg-indigo-500/[0.03]"
          >
            <div className="space-y-2">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Time Reclaimed</div>
              <div className="text-4xl font-black text-white leading-none">
                {Math.round(stats.time_saved_minutes / 60)}h {stats.time_saved_minutes % 60}m
              </div>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Clock size={28} />
            </div>
          </motion.div>
        </div>

        {/* Action Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-12 glass-card p-8 flex items-center justify-between bg-gradient-to-r from-primary-start/5 to-transparent"
        >
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-start/10 flex items-center justify-center text-primary-start">
              <Zap size={28} />
            </div>
            <div className="space-y-1">
              <div className="text-xl font-black text-white">Need to configure your AI?</div>
              <div className="text-sm font-semibold text-gray-500">Launch the Setup Assistant to refine your screening persona</div>
            </div>
          </div>
          <motion.a
            href="/welcome"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-premium px-10 h-14 text-lg"
          >
            Launch Setup Assistant
            <ArrowUpRight size={20} />
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
}
