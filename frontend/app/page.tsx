'use client';

/**
 * AI Gatekeeper Homepage
 * Professional, polished landing page with stats and call activity
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Phone, Ban, Clock, TrendingUp, Activity, ChevronRight, Loader2 } from 'lucide-react';
import { fetchDashboardStats, fetchRecentCalls } from '@/utils/api';
import { DashboardStats, Call } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    total_calls: 0,
    scams_blocked: 0,
    time_saved_minutes: 0,
    current_status: 'idle',
    today_calls: 0,
    block_rate: 0,
    avg_call_duration: 0,
  });
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, callsData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentCalls(10),
      ]);
      setStats(statsData);
      setCalls(callsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const blockRatePercent = Math.round(stats.block_rate * 100);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-8 pt-20 pb-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">System Active</span>
            </div>

            <h1 className="text-7xl font-black text-white mb-6 tracking-tight">
              AI <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Gatekeeper</span>
            </h1>
            <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">
              Your personal AI shield against spam, scams, and unwanted calls
            </p>
          </motion.div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} variant="glass" padding="lg" className="animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 mx-auto mb-4" />
                  <div className="h-10 bg-white/5 rounded mb-2" />
                  <div className="h-4 bg-white/5 rounded w-24 mx-auto" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass" padding="lg" className="text-center group hover:border-indigo-500/30">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Phone size={32} className="text-indigo-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{stats.total_calls.toLocaleString()}</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Calls</div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass" padding="lg" className="text-center group hover:border-rose-500/30">
                  <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Ban size={32} className="text-rose-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{stats.scams_blocked}</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Scams Blocked</div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass" padding="lg" className="text-center group hover:border-emerald-500/30">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Clock size={32} className="text-emerald-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{Math.round(stats.time_saved_minutes / 60)}h</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Time Saved</div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card variant="glass" padding="lg" className="text-center group hover:border-purple-500/30">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <TrendingUp size={32} className="text-purple-400" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{blockRatePercent}%</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">Block Rate</div>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Main Feature Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="premium" padding="lg" className="text-center">
              <div className="max-w-3xl mx-auto">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/50">
                  <Shield size={48} className="text-white" />
                </div>

                <h2 className="text-4xl font-black text-white mb-4">Full Protection Active</h2>
                <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
                  Your AI Gatekeeper is currently monitoring all incoming calls, analyzing caller intent,
                  and automatically blocking suspicious communications.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/dashboard">
                    <Button variant="primary" size="lg" icon={<ChevronRight size={20} />}>
                      Voice Interface
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="secondary" size="lg">
                      Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity */}
      {!isLoading && calls.length > 0 && (
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Activity size={32} className="text-indigo-400" />
              Recent Activity
            </h2>
            <Link href="/calls">
              <Button variant="ghost" size="sm">
                View All <ChevronRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {calls.slice(0, 6).map((call, index) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" padding="md" className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${call.outcome === 'blocked' ? 'bg-rose-500/10 text-rose-400' :
                      call.outcome === 'passed' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-gray-500/10 text-gray-400'
                    }`}>
                    {call.outcome === 'blocked' ? <Ban size={20} /> : <Phone size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{call.caller_number}</div>
                    <div className="text-sm text-gray-500 capitalize">{call.intent}</div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${call.outcome === 'blocked' ? 'bg-rose-500/10 text-rose-400' :
                      call.outcome === 'passed' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-gray-500/10 text-gray-400'
                    }`}>
                    {call.outcome}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
