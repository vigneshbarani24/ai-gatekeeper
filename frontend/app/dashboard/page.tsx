'use client';

/**
 * AI Gatekeeper Dashboard - Voice Interface
 * Professional voice interaction page with VoiceOrb component
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import VoiceOrb from '@/components/VoiceOrb';
import { fetchDashboardStats } from '@/utils/api';
import { DashboardStats } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total_calls: 0,
    scams_blocked: 0,
    time_saved_minutes: 0,
    current_status: 'idle',
    today_calls: 0,
    block_rate: 0,
    avg_call_duration: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={18} />}>
              Back
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Shield size={20} />
            </div>
            <span className="text-xl font-black text-white">AI Gatekeeper</span>
          </div>

          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            Voice Interface
          </h1>
          <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
            Interact with your AI Gatekeeper using voice commands
          </p>
        </motion.div>

        {/* Voice Orb */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={48} className="text-indigo-400 animate-spin" />
          </div>
        ) : (
          <VoiceOrb
            status={stats.current_status}
            callsBlocked={stats.scams_blocked}
            timeSaved={stats.time_saved_minutes}
          />
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 max-w-2xl mx-auto"
        >
          <Card variant="glass" padding="lg">
            <h3 className="text-xl font-bold text-white mb-4">How to Use</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">1.</span>
                <span>Click the "Talk to AI Agent" button to start a voice session</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">2.</span>
                <span>Speak naturally to configure your AI Gatekeeper settings</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-400 font-bold">3.</span>
                <span>The AI will respond and help you customize your call screening</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
