"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Zap,
  CheckCircle2,
  Activity,
  UserCheck
} from "lucide-react";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[200px] rounded-full pointer-events-none" />

      {/* Navigation Layer */}
      <nav className="w-full max-w-7xl px-10 py-10 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase">Gatekeeper</span>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-xs font-bold text-gray-500 hover:text-white cursor-pointer transition-colors">Enterprise</span>
          <span className="text-xs font-bold text-gray-500 hover:text-white cursor-pointer transition-colors">Security</span>
          <Link href="/">
            <button className="btn-secondary py-2 px-6 text-xs">Sign In</button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto w-full relative z-10 px-10 pt-20 pb-32 text-center">
        {/* Leading Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-md">
            <div className="p-1 rounded-full bg-success/20">
              <div className="w-2 h-2 rounded-full bg-success" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">v2.0 Neural Engine Online</span>
          </div>

          <h1 className="text-8xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-6">
            The neural <br />
            <span className="title-premium">firewall</span>.
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            Protecting your personal space with advanced AI screening.
            Neutralize scams, focus on what matters.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-10">
            <Link href="/" className="w-full md:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium w-full md:w-auto text-xl px-14 py-5 shadow-2xl"
              >
                Go to Dashboard
                <ArrowRight size={24} />
              </motion.button>
            </Link>
            <button className="btn-secondary px-12 py-5 text-xl font-bold flex items-center gap-3">
              Learn the Science
              <Activity size={20} className="text-indigo-400" />
            </button>
          </div>
        </motion.div>

        {/* Tactical Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-24 text-left">
          {[
            {
              icon: UserCheck,
              title: "Adaptive ID",
              desc: "Learns your contacts to provide seamless passage for friends.",
              delay: 0.1
            },
            {
              icon: Zap,
              title: "Neural Scan",
              desc: "Intercepts suspicious calls in milliseconds with sentiment analysis.",
              delay: 0.2
            },
            {
              icon: ShieldCheck,
              title: "Zero-Trust",
              desc: "Continuous cryptographic verification for all external links.",
              delay: 0.3
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay }}
              className="glass-card p-10 space-y-6 group hover:border-indigo-500/30"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                <feature.icon size={30} />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black text-white">{feature.title}</h4>
                <p className="text-gray-500 font-semibold leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Trust Footer */}
      <footer className="w-full max-w-7xl px-10 py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-4 text-xs font-bold text-gray-600 uppercase tracking-widest">
          &copy; 2025 Gatekeeper AI Research
        </div>
        <div className="flex items-center gap-8">
          <span className="text-xs font-bold text-gray-600 hover:text-white transition-colors cursor-pointer">Protocol</span>
          <span className="text-xs font-bold text-gray-600 hover:text-white transition-colors cursor-pointer">Encryption</span>
          <span className="text-xs font-bold text-gray-600 hover:text-white transition-colors cursor-pointer">Neural Node</span>
        </div>
      </footer>
    </div>
  );
}
