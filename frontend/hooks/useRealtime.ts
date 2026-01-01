/**
 * Real-time Updates Hook
 * Connects to backend SSE endpoint for live updates
 */

import { useEffect, useRef, useState } from 'react';
import { config } from '@/config';

export interface RealtimeEvent {
    type: 'call_created' | 'call_updated' | 'scam_blocked' | 'tool_executed' | 'analytics_updated' | 'ai_thinking';
    data: any;
    timestamp: string;
}

export interface AIThinkingEvent {
    agent: string;
    thought: string;
    data: any;
    timestamp: string;
}

export interface RealtimeOptions {
    onCallCreated?: (data: any) => void;
    onCallUpdated?: (data: any) => void;
    onScamBlocked?: (data: any) => void;
    onToolExecuted?: (data: any) => void;
    onAnalyticsUpdated?: (data: any) => void;
    onAIThinking?: (data: AIThinkingEvent) => void;
    onError?: (error: Error) => void;
}

/**
 * Hook to subscribe to real-time updates via Server-Sent Events
 *
 * @param userId - User ID to subscribe to
 * @param options - Event handlers
 *
 * @example
 * ```tsx
 * const { connected, error } = useRealtime('user_123', {
 *   onCallCreated: (data) => console.log('New call:', data),
 *   onScamBlocked: (data) => {
 *     toast.success(`Scam blocked: ${data.scam_type}`);
 *     refreshCalls();
 *   }
 * });
 * ```
 */
export function useRealtime(userId: string | null, options: RealtimeOptions = {}) {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttempts = useRef(0);

    useEffect(() => {
        if (!userId) {
            console.log('[Realtime] No user ID provided, skipping connection');
            return;
        }

        const connect = () => {
            try {
                // Close existing connection
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                }

                const url = `${config.apiUrl}/api/realtime/events/${userId}`;
                console.log(`[Realtime] Connecting to SSE: ${url}`);

                const eventSource = new EventSource(url);
                eventSourceRef.current = eventSource;

                // Connection opened
                eventSource.addEventListener('connected', (e) => {
                    console.log('[Realtime] Connected to SSE server', e.data);
                    setConnected(true);
                    setError(null);
                    reconnectAttempts.current = 0;
                });

                // Call created event
                eventSource.addEventListener('call_created', (e) => {
                    const event: RealtimeEvent = JSON.parse(e.data);
                    console.log('[Realtime] Call created:', event);
                    options.onCallCreated?.(event.data);
                });

                // Call updated event
                eventSource.addEventListener('call_updated', (e) => {
                    const event: RealtimeEvent = JSON.parse(e.data);
                    console.log('[Realtime] Call updated:', event);
                    options.onCallUpdated?.(event.data);
                });

                // Scam blocked event
                eventSource.addEventListener('scam_blocked', (e) => {
                    const event: RealtimeEvent = JSON.parse(e.data);
                    console.log('[Realtime] 🚨 Scam blocked:', event);
                    options.onScamBlocked?.(event.data);
                });

                // Tool executed event
                eventSource.addEventListener('tool_executed', (e) => {
                    const event: RealtimeEvent = JSON.parse(e.data);
                    console.log('[Realtime] Tool executed:', event);
                    options.onToolExecuted?.(event.data);
                });

                // Analytics updated event
                eventSource.addEventListener('analytics_updated', (e) => {
                    const event: RealtimeEvent = JSON.parse(e.data);
                    console.log('[Realtime] Analytics updated:', event);
                    options.onAnalyticsUpdated?.(event.data);
                });

                // AI thinking event
                eventSource.addEventListener('ai_thinking', (e) => {
                    const event: RealtimeEvent = JSON.parse(e.data);
                    console.log('[Realtime] 🤖 AI thinking:', event.data.thought);
                    options.onAIThinking?.(event.data as AIThinkingEvent);
                });

                // Error handler
                eventSource.onerror = (err) => {
                    console.error('[Realtime] SSE error:', err);
                    setConnected(false);

                    const error = new Error('SSE connection error');
                    setError(error);
                    options.onError?.(error);

                    // Exponential backoff reconnect
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
                    reconnectAttempts.current++;

                    console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (reconnectAttempts.current < 10) {
                            connect();
                        } else {
                            console.error('[Realtime] Max reconnect attempts reached');
                            const maxError = new Error('Max reconnect attempts reached');
                            setError(maxError);
                            options.onError?.(maxError);
                        }
                    }, delay);
                };

                // Open handler
                eventSource.onopen = () => {
                    console.log('[Realtime] SSE connection opened');
                };

            } catch (err) {
                console.error('[Realtime] Failed to create EventSource:', err);
                const error = err instanceof Error ? err : new Error('Failed to create EventSource');
                setError(error);
                options.onError?.(error);
            }
        };

        // Initial connection
        connect();

        // Cleanup
        return () => {
            console.log('[Realtime] Cleaning up SSE connection');
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            setConnected(false);
        };
    }, [userId, options.onCallCreated, options.onCallUpdated, options.onScamBlocked, options.onToolExecuted, options.onAnalyticsUpdated, options.onError]);

    return {
        connected,
        error,
        reconnectAttempts: reconnectAttempts.current
    };
}

/**
 * Simpler hook for just listening to all events
 */
export function useRealtimeEvents(userId: string | null, onEvent: (event: RealtimeEvent) => void) {
    return useRealtime(userId, {
        onCallCreated: (data) => onEvent({ type: 'call_created', data, timestamp: new Date().toISOString() }),
        onCallUpdated: (data) => onEvent({ type: 'call_updated', data, timestamp: new Date().toISOString() }),
        onScamBlocked: (data) => onEvent({ type: 'scam_blocked', data, timestamp: new Date().toISOString() }),
        onToolExecuted: (data) => onEvent({ type: 'tool_executed', data, timestamp: new Date().toISOString() }),
        onAnalyticsUpdated: (data) => onEvent({ type: 'analytics_updated', data, timestamp: new Date().toISOString() }),
    });
}
