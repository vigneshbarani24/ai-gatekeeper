'use client';

/**
 * AI Gatekeeper Dashboard
 * VOICE-FIRST CALL SCREENING WITH STUNNING UX
 *
 * Hero: Voice Orb - visualizes AI status in real-time
 * Features: Call history, scam detection, workflow automation
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Settings, History, RefreshCw } from 'lucide-react';
import VoiceOrb from '@/components/VoiceOrb';
import CallHistoryList from '@/components/CallHistoryList';
import { fetchDashboardStats, fetchRecentCalls, type Call } from '@/lib/api';

type View = 'dashboard' | 'history' | 'settings';

export default function Home() {
  const [view, setView] = useState<View>('dashboard');
  const [stats, setStats] = useState({
    total_calls: 0,
    scams_blocked: 0,
    time_saved_minutes: 0,
    current_status: 'idle' as 'idle' | 'active' | 'blocked' | 'emergency',
  });
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, callsData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentCalls(20),
      ]);
      setStats(statsData);
      setCalls(callsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orb-glow/20 flex items-center justify-center">
              <Shield size={24} className="text-orb-glow" />
            </div>
            <h1 className="text-xl font-bold">AI Gatekeeper</h1>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-full glass-card hover:bg-white/10 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {view === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Voice Orb Hero */}
            <VoiceOrb
              status={stats.current_status}
              callsBlocked={stats.scams_blocked}
              timeSaved={stats.time_saved_minutes}
            />

            {/* Recent Calls Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <History size={28} />
                  Recent Activity
                </h2>
                <button
                  onClick={() => setView('history')}
                  className="text-sm text-orb-glow hover:underline"
                >
                  View All →
                </button>
              </div>

              <CallHistoryList calls={calls.slice(0, 5)} />
            </div>
          </motion.div>
        )}

        {view === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setView('dashboard')}
                className="text-orb-glow hover:underline"
              >
                ← Back
              </button>
              <h2 className="text-3xl font-bold">Call History</h2>
            </div>

            <CallHistoryList calls={calls} />
          </motion.div>
        )}

        {view === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <Settings size={64} className="mx-auto mb-4 text-orb-glow" />
            <h2 className="text-2xl font-bold mb-2">Settings</h2>
            <p className="text-gray-400">Coming soon...</p>
            <button
              onClick={() => setView('dashboard')}
              className="mt-6 text-orb-glow hover:underline"
            >
              ← Back to Dashboard
            </button>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 pb-safe">
        <div className="container mx-auto px-4 py-3 flex justify-around">
          <button
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              view === 'dashboard'
                ? 'text-orb-glow bg-orb-glow/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={24} />
            <span className="text-xs">Dashboard</span>
          </button>

          <button
            onClick={() => setView('history')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              view === 'history'
                ? 'text-orb-glow bg-orb-glow/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History size={24} />
            <span className="text-xs">History</span>
          </button>

          <button
            onClick={() => setView('settings')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
              view === 'settings'
                ? 'text-orb-glow bg-orb-glow/10'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings size={24} />
            <span className="text-xs">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
