/**
 * COMPLETE WORKING DASHBOARD EXAMPLE
 * This shows ALL user stories working end-to-end
 *
 * Copy this to app/home/page.tsx to use it
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRealtime } from '@/hooks/useRealtime';
import { fetchDashboardStats, fetchRecentCalls } from '@/utils/api';
import type { DashboardStats, Call } from '@/types';
import AIActivityLog, { useAIActivityLog } from '@/components/AIActivityLog';
import type { AIThinkingEvent } from '@/hooks/useRealtime';

export default function CompleteDashboard() {
  // ============================================================================
  // State Management
  // ============================================================================

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // AI Activity Log
  const { addLog } = useAIActivityLog();

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, callsData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentCalls(10)
      ]);
      setStats(statsData);
      setCalls(callsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ============================================================================
  // Real-Time Updates (THIS IS THE MAGIC!)
  // ============================================================================

  const { connected, error } = useRealtime('demo_user', {
    // 🎯 USER STORY 1: New call comes in → UI updates instantly
    onCallCreated: (data) => {
      console.log('📞 New call incoming!', data);

      // Add to call list immediately
      const newCall: Call = {
        id: data.call_id || 'temp_id',
        caller_number: data.caller_number,
        caller_name: 'Incoming Call...',
        intent: 'unknown',
        scam_score: 0,
        action: 'screening',
        timestamp: data.timestamp,
        duration: 0,
        summary: 'Call in progress...'
      };

      setCalls(prev => [newCall, ...prev]);

      // Show notification
      showNotification('📞 Incoming Call', `From ${data.caller_number}`);

      // Play alert sound (optional)
      playAlertSound();

      // Refresh stats
      refreshStats();
    },

    // 🎯 USER STORY 2: Call status updates → UI syncs
    onCallUpdated: (data) => {
      console.log('📝 Call updated!', data);

      // Update call in list
      setCalls(prev => prev.map(call =>
        call.id === data.call_id || call.caller_number === data.caller_number
          ? { ...call, ...data.updates }
          : call
      ));

      // Refresh stats if call completed
      if (data.updates?.status === 'completed') {
        refreshStats();
      }
    },

    // 🎯 USER STORY 3: Scam blocked → Instant red alert!
    onScamBlocked: (data) => {
      console.log('🚨 SCAM BLOCKED!', data);

      // Update call in list with scam badge
      setCalls(prev => prev.map(call =>
        call.id === data.call_sid
          ? {
              ...call,
              intent: 'scam',
              scam_score: data.confidence,
              action: 'blocked',
              summary: `${data.scam_type} scam blocked`
            }
          : call
      ));

      // Show big red alert
      showNotification(
        '🛡️ Scam Blocked!',
        `${data.scam_type} (${Math.round(data.confidence * 100)}% confidence)`,
        'error'
      );

      // Play success sound
      playSuccessSound();

      // Update stats immediately
      setStats(prev => prev ? {
        ...prev,
        scams_blocked: prev.scams_blocked + 1,
        total_calls: prev.total_calls + 1
      } : null);
    },

    // 🎯 USER STORY 4: Tool executed → Show what happened
    onToolExecuted: (data) => {
      console.log('🔧 Tool executed:', data);

      // Show subtle notification
      if (data.tool === 'log_call') {
        showNotification('✅ Call Logged', `Intent: ${data.result.intent}`);
      } else if (data.tool === 'block_scam') {
        showNotification('🛡️ Scam Blocked', data.result.scam_type);
      } else if (data.tool === 'transfer_call') {
        showNotification('📲 Call Transferred', 'Connecting to your phone');
      }
    },

    // 🎯 USER STORY 5: Analytics updated → Dashboard refreshes
    onAnalyticsUpdated: (data) => {
      console.log('📊 Analytics updated:', data);
      setStats(prev => prev ? { ...prev, ...data } : null);
    },

    // 🎯 USER STORY 6: AI Thinking - Show what AI is doing
    onAIThinking: (data: AIThinkingEvent) => {
      console.log('🤖 AI thinking:', data.thought);

      // Add to activity log
      addLog(data);

      // Show notification for critical events
      if (data.agent === 'scam_detector' && data.thought.includes('SCAM DETECTED')) {
        showNotification('🚨 AI Alert', data.thought, 'error');
      }
    },

    // Error handling
    onError: (error) => {
      console.error('Real-time connection error:', error);
    }
  });

  // Track connection status
  useEffect(() => {
    setRealtimeConnected(connected);
  }, [connected]);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const refreshStats = async () => {
    try {
      const newStats = await fetchDashboardStats();
      setStats(newStats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const showNotification = (title: string, message: string, type: 'info' | 'success' | 'error' = 'info') => {
    // Use your toast library here
    // toast[type](title, { description: message });

    // For demo, use browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const playAlertSound = () => {
    // Play notification sound
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(e => console.log('Could not play sound:', e));
  };

  const playSuccessSound = () => {
    const audio = new Audio('/sounds/success.mp3');
    audio.play().catch(e => console.log('Could not play sound:', e));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallBadgeColor = (action: string) => {
    switch (action) {
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'passed': return 'bg-green-100 text-green-800';
      case 'screening': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCallIcon = (intent: string, action: string) => {
    if (action === 'blocked') return '🚫';
    if (intent === 'scam') return '🚨';
    if (intent === 'friend') return '👋';
    if (intent === 'appointment') return '📅';
    if (intent === 'sales') return '📞';
    return '❓';
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      {/* ========== Header ========== */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              AI Gatekeeper
            </h1>
            <p className="text-gray-600 mt-1">
              Your intelligent call protection system
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">
              {realtimeConnected ? '● Live' : '○ Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* ========== Stats Grid ========== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Calls */}
        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">📞</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.total_calls || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Scams Blocked */}
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <p className="text-sm text-white/80">Scams Blocked</p>
              <p className="text-3xl font-bold text-white">
                {stats?.scams_blocked || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Time Saved */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <div>
              <p className="text-sm text-white/80">Time Saved</p>
              <p className="text-3xl font-bold text-white">
                {stats?.time_saved_minutes || 0} min
              </p>
            </div>
          </div>
        </div>

        {/* Today's Calls */}
        <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Today's Calls</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.today_calls || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== AI Activity Log ========== */}
      <div className="mb-8">
        <AIActivityLog className="mb-8" />
      </div>

      {/* ========== Recent Calls ========== */}
      <div className="bg-white rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>

        {calls.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl">🛡️</span>
            <h3 className="text-xl font-bold text-gray-900 mt-4">All Quiet</h3>
            <p className="text-gray-600 mt-2">No calls yet. Your AI is standing by.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call, index) => (
              <div
                key={call.id || index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <span className="text-2xl">
                    {getCallIcon(call.intent, call.action)}
                  </span>
                </div>

                {/* Call Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">
                      {call.caller_name || 'Unknown'}
                    </p>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCallBadgeColor(call.action)}`}>
                      {call.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{call.caller_number}</p>
                  {call.summary && (
                    <p className="text-sm text-gray-500 mt-1">{call.summary}</p>
                  )}
                </div>

                {/* Scam Score (if applicable) */}
                {call.scam_score > 0.5 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Scam Score</p>
                    <p className={`text-lg font-bold ${call.scam_score > 0.8 ? 'text-red-600' : 'text-yellow-600'}`}>
                      {Math.round(call.scam_score * 100)}%
                    </p>
                  </div>
                )}

                {/* Duration */}
                {call.duration > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDuration(call.duration)}
                    </p>
                  </div>
                )}

                {/* Time */}
                <div className="text-right text-sm text-gray-500">
                  {new Date(call.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========== Status Bar ========== */}
      <div className="mt-8 bg-white rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${stats?.current_status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-sm font-medium text-gray-900">
              AI Status: {stats?.current_status || 'idle'}
            </span>
          </div>

          <div className="text-sm text-gray-600">
            Block Rate: {Math.round((stats?.block_rate || 0) * 100)}%
          </div>

          <div className="text-sm text-gray-600">
            Avg Duration: {stats?.avg_call_duration || 0}s
          </div>
        </div>
      </div>
    </div>
  );
}
