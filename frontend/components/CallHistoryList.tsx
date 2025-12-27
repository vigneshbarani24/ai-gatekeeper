'use client';

import { motion } from 'framer-motion';
import { Phone, Shield, AlertTriangle, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Call {
  id: string;
  caller_number: string;
  intent: string;
  scam_score: number;
  timestamp: string;
  duration: number;
  action_taken: 'blocked' | 'passed' | 'screened';
}

interface CallHistoryListProps {
  calls: Call[];
}

const INTENT_ICONS = {
  scam: AlertTriangle,
  sales: Phone,
  friend: User,
  appointment: Clock,
  unknown: Shield,
};

const INTENT_COLORS = {
  scam: '#ff3366',
  sales: '#ffaa00',
  friend: '#00ff88',
  appointment: '#00ffff',
  unknown: '#888',
};

export default function CallHistoryList({ calls }: CallHistoryListProps) {
  if (calls.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Shield size={48} className="mx-auto mb-4 opacity-50" />
        <p>No calls yet. Your AI Gatekeeper is ready!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {calls.map((call, index) => {
        const Icon = INTENT_ICONS[call.intent as keyof typeof INTENT_ICONS] || Shield;
        const color = INTENT_COLORS[call.intent as keyof typeof INTENT_COLORS] || '#888';

        return (
          <motion.div
            key={call.id}
            className="glass-card p-4 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `${color}20`,
                  border: `2px solid ${color}40`,
                }}
              >
                <Icon size={24} color={color} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-white truncate">
                    {call.caller_number}
                  </h3>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                    style={{
                      background: `${color}20`,
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {call.action_taken}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-2 capitalize">
                  {call.intent} {call.scam_score > 0.7 && `• ${Math.round(call.scam_score * 100)}% scam`}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}
                  </span>
                  <span>{call.duration}s</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
