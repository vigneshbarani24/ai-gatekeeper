'use client';

/**
 * AI Gatekeeper Calls Page
 * Professional call history with filtering and details
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Phone, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { fetchRecentCalls } from '@/utils/api';
import { Call } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'passed' | 'screened'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRecentCalls(50);
      setCalls(data);
    } catch (error) {
      console.error('Error loading calls:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCalls = filter === 'all' ? calls : calls.filter(c => c.outcome === filter);

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

          <h1 className="text-2xl font-black text-white">Call History</h1>

          <div className="w-20" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {[
            { label: 'All', value: 'all' as const },
            { label: 'Blocked', value: 'blocked' as const },
            { label: 'Passed', value: 'passed' as const },
            { label: 'Screened', value: 'screened' as const },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Calls List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} variant="glass" padding="md" className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/5" />
                  <div className="flex-1">
                    <div className="h-5 bg-white/5 rounded w-32 mb-2" />
                    <div className="h-4 bg-white/5 rounded w-24" />
                  </div>
                  <div className="h-6 bg-white/5 rounded w-16" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="text-center py-20">
            <Phone size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-500 font-semibold">No calls found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCalls.map((call, index) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" padding="md" hover className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${call.outcome === 'blocked' ? 'bg-rose-500/10 text-rose-400' :
                      call.outcome === 'passed' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-indigo-500/10 text-indigo-400'
                    }`}>
                    {call.outcome === 'blocked' ? <Ban size={20} /> :
                      call.outcome === 'passed' ? <CheckCircle size={20} /> :
                        <Phone size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{call.caller_number}</div>
                    <div className="text-sm text-gray-500 capitalize">{call.intent || 'Unknown'}</div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-bold uppercase mb-1 ${call.outcome === 'blocked' ? 'text-rose-400' :
                        call.outcome === 'passed' ? 'text-emerald-400' :
                          'text-indigo-400'
                      }`}>
                      {call.outcome}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(call.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
