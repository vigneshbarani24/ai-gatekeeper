import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Stats Type
export interface DashboardStats {
  total_calls: number;
  scams_blocked: number;
  time_saved_minutes: number;
  today_calls: number; // Renamed from calls_today
  current_status: 'idle' | 'active' | 'blocked' | 'emergency';
  block_rate: number;
  avg_call_duration: number;
}

// Call Type
export interface Call {
  id: string;
  caller_name: string;
  caller_number: string;
  outcome: 'blocked' | 'passed' | 'screened';
  intent: string;
  scam_score: number;
  created_at: string;
  duration: number;
  summary?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const res = await fetch(`${API_URL}/api/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  } catch (error) {
    console.error(error);
    // Return empty fallback
    return {
      total_calls: 0,
      scams_blocked: 0,
      time_saved_minutes: 0,
      today_calls: 0,
      current_status: 'idle',
      block_rate: 0,
      avg_call_duration: 0,
    };
  }
}

export async function fetchRecentCalls(limit = 10): Promise<Call[]> {
  try {
    const res = await fetch(`${API_URL}/api/calls/recent?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch calls');
    
    // Map backend response (which returns 'action' and 'timestamp') to frontend 'Call' (outcome, created_at)
    const data = await res.json();
    
    return data.map((item: any) => ({
      id: item.id,
      caller_name: item.caller_name,
      caller_number: item.caller_number,
      outcome: item.action, // Map action -> outcome
      intent: item.intent,
      scam_score: item.scam_score,
      created_at: item.timestamp, // Map timestamp -> created_at
      duration: item.duration,
      summary: item.summary,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
