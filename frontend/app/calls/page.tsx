'use client';

/**
 * AI Gatekeeper - Call History Page
 * View all screened calls with transcripts
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ChevronLeft,
  Phone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Filter,
  Calendar,
  Lock,
  UserPlus,
} from 'lucide-react';

type CallOutcome = 'blocked' | 'screened' | 'passed' | 'voicemail';

type Call = {
  id: string;
  caller_number: string;
  caller_name?: string;
  outcome: CallOutcome;
  duration: number; // seconds
  transcript: string;
  reason?: string;
  created_at: string;
};

export default function CallsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<CallOutcome | 'all'>('all');
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  // Demo calls
  const calls: Call[] = [
    {
      id: '1',
      caller_number: '+1 (555) 999-0001',
      caller_name: 'Suspected Scam',
      outcome: 'blocked',
      duration: 8,
      transcript: "Caller: This is the IRS calling about your outstanding tax debt. You must—\n\nAI: [SCAM DETECTED - CALL TERMINATED]",
      reason: 'IRS impersonation scam detected',
      created_at: '2025-12-27T10:15:00Z',
    },
    {
      id: '2',
      caller_number: '+1 (555) 234-5678',
      caller_name: 'Mom',
      outcome: 'passed',
      duration: 0,
      transcript: '[Whitelisted contact - automatically connected]',
      created_at: '2025-12-27T09:30:00Z',
    },
    {
      id: '3',
      caller_number: '+1 (555) 888-7777',
      caller_name: 'Nobu Restaurant',
      outcome: 'screened',
      duration: 45,
      transcript: "AI: Hi, this is Sarah's assistant. How can I help you?\n\nCaller: This is Nobu Restaurant calling to confirm your reservation for Saturday at 7pm.\n\nAI: Perfect! That's confirmed. Looking forward to it.\n\n[Call ended - Reservation confirmed]",
      reason: 'Legitimate business inquiry',
      created_at: '2025-12-27T09:00:00Z',
    },
    {
      id: '4',
      caller_number: '+1 (555) 999-0002',
      caller_name: 'Unknown',
      outcome: 'blocked',
      duration: 12,
      transcript: "Caller: Hi, I'm calling about extending your car's warranty—\n\nAI: [SCAM DETECTED - CALL TERMINATED]",
      reason: 'Car warranty scam pattern',
      created_at: '2025-12-27T08:45:00Z',
    },
    {
      id: '5',
      caller_number: '+1 (555) 456-7890',
      caller_name: 'Dr. Smith Office',
      outcome: 'screened',
      duration: 30,
      transcript: "AI: Hi, this is Sarah's assistant. How can I help you?\n\nCaller: This is Dr. Smith's office calling to remind you of your appointment tomorrow at 2pm.\n\nAI: Thank you! I'll make sure Sarah knows.\n\n[Notification sent to user]",
      reason: 'Appointment reminder',
      created_at: '2025-12-27T08:15:00Z',
    },
    {
      id: '6',
      caller_number: '+1 (555) 345-6789',
      caller_name: 'Best Friend Sarah',
      outcome: 'passed',
      duration: 0,
      transcript: '[Whitelisted contact - automatically connected]',
      created_at: '2025-12-26T18:30:00Z',
    },
  ];

  const filteredCalls = filter === 'all'
    ? calls
    : calls.filter(call => call.outcome === filter);

  const stats = {
    total: calls.length,
    blocked: calls.filter(c => c.outcome === 'blocked').length,
    screened: calls.filter(c => c.outcome === 'screened').length,
    passed: calls.filter(c => c.outcome === 'passed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>

          <h1 className="text-xl font-bold text-gray-900">Call History</h1>

          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <Calendar size={24} className="text-gray-700" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats */}
        <motion.div
          className="mb-6 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatCard
            icon={AlertTriangle}
            label="Blocked"
            value={stats.blocked}
            color="bg-red-100 text-red-700"
          />
          <StatCard
            icon={CheckCircle}
            label="Screened"
            value={stats.screened}
            color="bg-blue-100 text-blue-700"
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FilterChip
            label="All"
            count={stats.total}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterChip
            label="Blocked"
            count={stats.blocked}
            active={filter === 'blocked'}
            onClick={() => setFilter('blocked')}
            color="red"
          />
          <FilterChip
            label="Screened"
            count={stats.screened}
            active={filter === 'screened'}
            onClick={() => setFilter('screened')}
            color="blue"
          />
          <FilterChip
            label="Passed"
            count={stats.passed}
            active={filter === 'passed'}
            onClick={() => setFilter('passed')}
            color="green"
          />
        </motion.div>

        {/* Calls List */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredCalls.map((call, index) => (
              <CallCard
                key={call.id}
                call={call}
                delay={index * 0.05}
                onClick={() => setSelectedCall(call)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Call Detail Modal */}
      <AnimatePresence>
        {selectedCall && (
          <CallDetailModal
            call={selectedCall}
            onClose={() => setSelectedCall(null)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-around">
          <NavButton icon={Shield} label="Dashboard" onClick={() => router.push('/dashboard')} />
          <NavButton icon={Phone} label="Calls" active />
          <NavButton icon={UserPlus} label="Contacts" onClick={() => router.push('/contacts')} />
          <NavButton icon={Lock} label="Settings" onClick={() => router.push('/settings')} />
        </div>
      </nav>
    </div>
  );
}

// ============================================================================
// Components
// ============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-2xl p-4 flex items-center gap-3`}>
      <Icon size={24} />
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs font-semibold">{label}</div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  color = 'gray',
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
        active
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
          : colors[color as keyof typeof colors]
      }`}
    >
      {label} ({count})
    </button>
  );
}

function CallCard({
  call,
  delay,
  onClick,
}: {
  call: Call;
  delay: number;
  onClick: () => void;
}) {
  const getOutcomeConfig = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'blocked':
        return {
          icon: XCircle,
          label: 'Blocked',
          color: 'from-red-400 to-red-500',
          bg: 'bg-red-100',
          text: 'text-red-700',
        };
      case 'screened':
        return {
          icon: CheckCircle,
          label: 'Screened',
          color: 'from-blue-400 to-blue-500',
          bg: 'bg-blue-100',
          text: 'text-blue-700',
        };
      case 'passed':
        return {
          icon: CheckCircle,
          label: 'Auto-passed',
          color: 'from-green-400 to-green-500',
          bg: 'bg-green-100',
          text: 'text-green-700',
        };
      default:
        return {
          icon: Phone,
          label: 'Unknown',
          color: 'from-gray-400 to-gray-500',
          bg: 'bg-gray-100',
          text: 'text-gray-700',
        };
    }
  };

  const config = getOutcomeConfig(call.outcome);
  const Icon = config.icon;

  return (
    <motion.button
      className="w-full bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay }}
      layout
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={24} className="text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {call.caller_name || call.caller_number}
            </h4>
            <span className={`text-xs font-semibold ${config.text} ${config.bg} px-2 py-1 rounded-full whitespace-nowrap ml-2`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{call.caller_number}</p>
          {call.reason && (
            <p className="text-xs text-gray-500 mb-2">{call.reason}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(call.created_at).toLocaleString()}
            </span>
            {call.duration > 0 && (
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {call.duration}s
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function CallDetailModal({
  call,
  onClose,
}: {
  call: Call;
  onClose: () => void;
}) {
  const getOutcomeConfig = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'blocked':
        return {
          icon: XCircle,
          label: 'Blocked Scam',
          color: 'from-red-400 to-red-500',
          bg: 'bg-red-50',
          text: 'text-red-700',
        };
      case 'screened':
        return {
          icon: CheckCircle,
          label: 'Successfully Screened',
          color: 'from-blue-400 to-blue-500',
          bg: 'bg-blue-50',
          text: 'text-blue-700',
        };
      case 'passed':
        return {
          icon: CheckCircle,
          label: 'Whitelisted Contact',
          color: 'from-green-400 to-green-500',
          bg: 'bg-green-50',
          text: 'text-green-700',
        };
      default:
        return {
          icon: Phone,
          label: 'Unknown',
          color: 'from-gray-400 to-gray-500',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
        };
    }
  };

  const config = getOutcomeConfig(call.outcome);
  const Icon = config.icon;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${config.bg} ${config.text} p-6 border-b border-gray-200`}>
          <div className="flex items-start gap-4 mb-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}
            >
              <Icon size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {call.caller_name || 'Unknown Caller'}
              </h2>
              <p className="text-lg mb-2">{call.caller_number}</p>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-sm font-semibold">
                <Icon size={16} />
                {config.label}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Call Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Call Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label="Date & Time"
                value={new Date(call.created_at).toLocaleString()}
              />
              <InfoItem
                label="Duration"
                value={call.duration > 0 ? `${call.duration} seconds` : 'N/A'}
              />
              {call.reason && (
                <InfoItem
                  label="Reason"
                  value={call.reason}
                  fullWidth
                />
              )}
            </div>
          </div>

          {/* Transcript */}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
              <FileText size={16} />
              Transcript
            </h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {call.transcript}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            {call.outcome === 'blocked' && (
              <button className="flex-1 px-4 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors">
                Report Scam
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <div className="text-xs font-semibold text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
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
