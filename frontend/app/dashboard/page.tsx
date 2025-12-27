'use client';

/**
 * AI Gatekeeper - Modern Light Dashboard
 * Beautiful, data-rich, mobile-first
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Phone,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Menu,
  Bell,
  Sparkles,
  X,
} from 'lucide-react';
import { fetchDashboardStats, fetchRecentCalls, type Call } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('there');
  const [stats, setStats] = useState({
    total_calls: 0,
    scams_blocked: 0,
    time_saved_minutes: 0,
    calls_today: 0,
  });
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good Morning');
  const [showOrbModal, setShowOrbModal] = useState(false);

  useEffect(() => {
    // Check onboarding
    const hasOnboarded = localStorage.getItem('hasOnboarded');
    if (!hasOnboarded) {
      router.push('/welcome');
      return;
    }

    // Load user name
    const savedName = localStorage.getItem('userName') || 'there';
    setUserName(savedName);

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    // Load data
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, callsData] = await Promise.all([
        fetchDashboardStats(),
        fetchRecentCalls(10),
      ]);
      setStats(statsData);
      setRecentCalls(callsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Menu size={24} className="text-gray-700" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900">AI Gatekeeper</span>
          </div>

          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
            <Bell size={24} className="text-gray-700" />
            {stats.scams_blocked > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Personalized Greeting */}
        <motion.div
          className="mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {greeting}, {userName}
          </h1>
          <p className="text-sm text-gray-600">
            {stats.calls_today > 0
              ? `${stats.calls_today} calls handled when you were busy`
              : 'Standing by for calls you can\'t take'}
          </p>
        </motion.div>

        {/* THE ORB - HERO ELEMENT */}
        <motion.div
          className="mb-12 flex flex-col items-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: 'spring', bounce: 0.4 }}
        >
          <div className="relative">
            {/* Outer Pulsing Rings */}
            <motion.div
              className="absolute inset-0 w-64 h-64 -translate-x-16 -translate-y-16"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.1, 0.4],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 blur-3xl" />
            </motion.div>

            {/* Middle Ring */}
            <motion.div
              className="absolute inset-0 w-56 h-56 -translate-x-12 -translate-y-12"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.2, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 blur-2xl" />
            </motion.div>

            {/* Main Orb - MASSIVE */}
            <motion.button
              onClick={() => setShowOrbModal(true)}
              className="relative w-48 h-48 mx-auto bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
              animate={{
                boxShadow: [
                  '0 20px 100px rgba(59, 130, 246, 0.6)',
                  '0 30px 120px rgba(147, 51, 234, 0.7)',
                  '0 20px 100px rgba(59, 130, 246, 0.6)',
                ],
                scale: [1, 1.03, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Inner Shimmer */}
              <motion.div
                className="absolute inset-6 bg-gradient-to-br from-white/50 to-transparent rounded-full"
                animate={{ opacity: [0.7, 0.4, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Shield Icon */}
              <Shield size={96} className="text-white relative z-10" strokeWidth={2} />

              {/* Status Indicator */}
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </motion.div>
            </motion.button>

            {/* Orbiting Sparkles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${50 + 70 * Math.cos((i * Math.PI * 2) / 8)}%`,
                  top: `${50 + 70 * Math.sin((i * Math.PI * 2) / 8)}%`,
                }}
                animate={{
                  y: [-8, 8, -8],
                  opacity: [0.6, 1, 0.6],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 3 + i * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles size={16} className="text-yellow-400" />
              </motion.div>
            ))}
          </div>

          {/* Status Text Below Orb */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-700">
                Standing By for You
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats - Minimal Chips */}
        <motion.div
          className="mb-8 flex justify-center gap-3 flex-wrap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <StatChip
            icon={Clock}
            value={`${stats.time_saved_minutes} min`}
            label="saved"
            color="bg-orange-100 text-orange-700"
          />
          <StatChip
            icon={Shield}
            value={stats.scams_blocked.toString()}
            label="blocked"
            color="bg-red-100 text-red-700"
          />
          <StatChip
            icon={Phone}
            value={stats.total_calls.toString()}
            label="handled"
            color="bg-blue-100 text-blue-700"
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-blue-500 font-semibold text-sm hover:underline">
              See All
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <LoadingState />
            ) : recentCalls.length > 0 ? (
              recentCalls.slice(0, 5).map((call, index) => (
                <CallCard key={call.id} call={call} delay={0.6 + index * 0.1} />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <ActionCard
            icon="📱"
            title="Add Contact"
            description="Whitelist trusted callers"
          />
          <ActionCard
            icon="⚙️"
            title="Settings"
            description="Customize your AI"
          />
        </motion.div>
      </main>

      {/* Orb Modal - AI Summary & Insights */}
      <AnimatePresence>
        {showOrbModal && (
          <OrbModal
            userName={userName}
            stats={stats}
            recentCalls={recentCalls}
            onClose={() => setShowOrbModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-around">
          <NavButton icon={Shield} label="Dashboard" active />
          <NavButton icon={Phone} label="Calls" />
          <NavButton icon={TrendingUp} label="Insights" />
          <NavButton icon={Settings} label="Settings" />
        </div>
      </nav>
    </div>
  );
}

// ============================================================================
// Components
// ============================================================================

function OrbModal({
  userName,
  stats,
  recentCalls,
  onClose,
}: {
  userName: string;
  stats: {
    total_calls: number;
    scams_blocked: number;
    time_saved_minutes: number;
    calls_today: number;
  };
  recentCalls: Call[];
  onClose: () => void;
}) {
  // Generate AI summary based on stats
  const generateSummary = () => {
    if (stats.calls_today === 0) {
      return "It's been quiet today. I'm standing by, ready to catch any calls you can't take.";
    }

    const summaryParts = [];

    if (stats.calls_today > 0) {
      summaryParts.push(`I handled ${stats.calls_today} call${stats.calls_today > 1 ? 's' : ''} while you were busy`);
    }

    if (stats.scams_blocked > 0) {
      summaryParts.push(`blocked ${stats.scams_blocked} scam${stats.scams_blocked > 1 ? 's' : ''}`);
    }

    if (stats.time_saved_minutes > 0) {
      summaryParts.push(`saved you ${stats.time_saved_minutes} minutes this week`);
    }

    return `Hi ${userName}! ${summaryParts.join(', ')}. You never missed an opportunity.`;
  };

  // Generate insights
  const getInsights = () => {
    const insights = [];

    const lastScam = recentCalls.find(c => c.outcome === 'blocked');
    if (lastScam) {
      insights.push({
        icon: '🛡️',
        text: `Last scam blocked: ${new Date(lastScam.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        color: 'text-red-600 bg-red-50',
      });
    }

    const lastHandled = recentCalls.find(c => c.outcome === 'screened');
    if (lastHandled) {
      insights.push({
        icon: '✅',
        text: `Last handled: ${lastHandled.caller_name || 'Unknown'} - ${lastHandled.reason || 'Call screened'}`,
        color: 'text-blue-600 bg-blue-50',
      });
    }

    if (stats.time_saved_minutes >= 45) {
      insights.push({
        icon: '⏰',
        text: 'Almost an hour saved this week!',
        color: 'text-orange-600 bg-orange-50',
      });
    }

    if (insights.length === 0) {
      insights.push({
        icon: '💤',
        text: 'All quiet. No missed opportunities.',
        color: 'text-gray-600 bg-gray-50',
      });
    }

    return insights;
  };

  const summary = generateSummary();
  const insights = getInsights();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Orb */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-t-3xl border-b border-gray-200">
          <div className="flex items-start gap-4">
            {/* Mini Orb */}
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0"
              animate={{
                boxShadow: [
                  '0 10px 40px rgba(59, 130, 246, 0.4)',
                  '0 15px 50px rgba(147, 51, 234, 0.5)',
                  '0 10px 40px rgba(59, 130, 246, 0.4)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Shield size={32} className="text-white" strokeWidth={2} />
            </motion.div>

            {/* Summary */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Your Guardian's Report
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {summary}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl transition-colors"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <Phone size={20} className="text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-900">{stats.total_calls}</div>
              <div className="text-xs text-blue-700">Handled</div>
            </div>
            <div className="bg-red-50 rounded-2xl p-3 text-center">
              <Shield size={20} className="text-red-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-red-900">{stats.scams_blocked}</div>
              <div className="text-xs text-red-700">Blocked</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center">
              <Clock size={20} className="text-orange-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-orange-900">{stats.time_saved_minutes}</div>
              <div className="text-xs text-orange-700">Min Saved</div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                className={`p-3 rounded-2xl ${insight.color} flex items-start gap-3`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="text-2xl">{insight.icon}</span>
                <p className="text-sm font-medium flex-1">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-3">💡 Tip</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {stats.scams_blocked > 5
              ? "You're getting a lot of scam calls. Consider adding your important contacts to the whitelist so they always reach you directly."
              : "Add your closest contacts to the whitelist to ensure they always ring through to you immediately."}
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Got it
          </button>
          <button
            onClick={() => {
              onClose();
              // Navigate to calls page - we'll need router for this
            }}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            View Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatChip({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: any;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${color} font-semibold text-sm`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon size={16} />
      <span>
        {value} <span className="font-normal">{label}</span>
      </span>
    </motion.div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon size={24} className="text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
}

function CallCard({ call, delay }: { call: Call; delay: number }) {
  const isScam = call.outcome === 'blocked';
  const isPassed = call.outcome === 'passed';

  return (
    <motion.div
      className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isScam
              ? 'bg-red-100'
              : isPassed
              ? 'bg-green-100'
              : 'bg-gray-100'
          }`}
        >
          {isScam ? (
            <AlertTriangle size={24} className="text-red-500" />
          ) : isPassed ? (
            <CheckCircle size={24} className="text-green-500" />
          ) : (
            <Phone size={24} className="text-gray-500" />
          )}
        </div>

        <div className="flex-1">
          <div className="font-semibold text-gray-900">{call.caller_name || call.caller_number}</div>
          <div className="text-sm text-gray-600">
            {isScam ? 'Scam blocked' : isPassed ? 'Transferred' : 'Screened'}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">
            {new Date(call.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <motion.button
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all text-left"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="font-semibold text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </motion.button>
  );
}

function NavButton({
  icon: Icon,
  label,
  active = false,
}: {
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
        active
          ? 'text-blue-500 bg-blue-50'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon size={24} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-md animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
        <Shield size={32} className="text-white" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">All Quiet</h3>
      <p className="text-gray-600">No calls missed. I'm standing by whenever you need me.</p>
    </div>
  );
}
