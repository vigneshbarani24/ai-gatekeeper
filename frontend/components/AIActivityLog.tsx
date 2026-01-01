/**
 * AI Activity Log Component
 * Shows real-time AI thinking and agent activity
 *
 * This makes the AI feel "alive" by showing what it's doing in real-time:
 * - "Checking calendar for Friday..."
 * - "🚨 SCAM DETECTED: IRS impersonation"
 * - "Logging call as 'appointment'"
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { AIThinkingEvent } from '@/hooks/useRealtime';

export interface AIActivityLogProps {
  maxLogs?: number;
  className?: string;
  autoScroll?: boolean;
}

export default function AIActivityLog({
  maxLogs = 50,
  className = '',
  autoScroll = true
}: AIActivityLogProps) {
  const [logs, setLogs] = useState<AIThinkingEvent[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Expose addLog method to parent
  useEffect(() => {
    // This is accessed via ref from parent component
    (window as any).addAILog = (log: AIThinkingEvent) => {
      setLogs(prev => {
        const newLogs = [log, ...prev].slice(0, maxLogs);
        return newLogs;
      });
    };

    return () => {
      delete (window as any).addAILog;
    };
  }, [maxLogs]);

  const getAgentIcon = (agent: string): string => {
    switch (agent) {
      case 'scam_detector': return '🛡️';
      case 'calendar_agent': return '📅';
      case 'contact_matcher': return '👤';
      case 'screener_agent': return '📝';
      case 'decision_agent': return '🎯';
      default: return '🤖';
    }
  };

  const getAgentColor = (agent: string): string => {
    switch (agent) {
      case 'scam_detector': return 'bg-red-50 border-red-200 text-red-700';
      case 'calendar_agent': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'contact_matcher': return 'bg-green-50 border-green-200 text-green-700';
      case 'screener_agent': return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'decision_agent': return 'bg-orange-50 border-orange-200 text-orange-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  if (logs.length === 0) {
    return (
      <div className={`bg-white rounded-3xl p-6 shadow-lg ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Activity Log
        </h2>
        <div className="text-center py-8">
          <span className="text-6xl">💤</span>
          <p className="text-gray-500 mt-4">AI is idle - waiting for calls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Activity Log
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
      </div>

      <div
        ref={logContainerRef}
        className="space-y-2 max-h-96 overflow-y-auto pr-2"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f7fafc'
        }}
      >
        {logs.map((log, index) => (
          <div
            key={`${log.timestamp}-${index}`}
            className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${getAgentColor(log.agent)}`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{getAgentIcon(log.agent)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {log.agent.replace('_', ' ')}
                  </span>
                  <span className="text-xs opacity-60">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  {log.thought}
                </p>

                {/* Show additional data if present */}
                {log.data && Object.keys(log.data).length > 0 && (
                  <div className="mt-2 text-xs opacity-75 space-y-1">
                    {log.data.scam_type && (
                      <div>Type: <span className="font-semibold">{log.data.scam_type}</span></div>
                    )}
                    {log.data.confidence !== undefined && (
                      <div>Confidence: <span className="font-semibold">{Math.round(log.data.confidence * 100)}%</span></div>
                    )}
                    {log.data.intent && (
                      <div>Intent: <span className="font-semibold">{log.data.intent}</span></div>
                    )}
                    {log.data.red_flags && log.data.red_flags.length > 0 && (
                      <div>
                        Red flags: <span className="font-semibold">{log.data.red_flags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{logs.length} {logs.length === 1 ? 'entry' : 'entries'}</span>
          <button
            onClick={() => setLogs([])}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear logs
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to easily add AI logs from parent component
 */
export function useAIActivityLog() {
  const addLog = (log: AIThinkingEvent) => {
    if ((window as any).addAILog) {
      (window as any).addAILog(log);
    }
  };

  return { addLog };
}
