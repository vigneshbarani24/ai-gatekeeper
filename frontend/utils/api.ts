/**
 * API Client with Error Handling and Retry Logic
 * Industry-grade API client with proper error handling, retries, and type safety
 */

import { config } from '@/config';
import { DashboardStats, Call, APIError, APIException } from '@/types';

// ============================================================================
// Configuration
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 10000; // 10 seconds

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Delays execution for a specified number of milliseconds
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculates exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
    return RETRY_DELAY * Math.pow(2, attempt);
}

/**
 * Creates an AbortController with timeout
 */
function createTimeoutController(timeoutMs: number): AbortController {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeoutMs);
    return controller;
}

// ============================================================================
// HTTP Client
// ============================================================================

/**
 * Makes an HTTP request with retry logic and error handling
 */
async function fetchWithRetry<T>(
    url: string,
    options: RequestInit = {},
    retries = MAX_RETRIES
): Promise<T> {
    const controller = createTimeoutController(REQUEST_TIMEOUT);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // Handle HTTP errors
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: response.statusText,
                code: 'HTTP_ERROR',
                status: response.status,
            }));

            throw new APIException({
                message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                code: errorData.code || 'HTTP_ERROR',
                status: response.status,
                details: errorData.details,
            });
        }

        // Parse and return response
        const data = await response.json();
        return data as T;

    } catch (error) {
        // Don't retry on client errors (4xx)
        if (error instanceof APIException && error.status >= 400 && error.status < 500) {
            throw error;
        }

        // Retry on network errors or server errors (5xx)
        if (retries > 0) {
            const retryDelay = getRetryDelay(MAX_RETRIES - retries);
            console.warn(`Request failed, retrying in ${retryDelay}ms... (${retries} retries left)`);
            await delay(retryDelay);
            return fetchWithRetry<T>(url, options, retries - 1);
        }

        // Convert generic errors to APIException
        if (error instanceof APIException) {
            throw error;
        }

        throw new APIException({
            message: error instanceof Error ? error.message : 'An unknown error occurred',
            code: 'NETWORK_ERROR',
            status: 0,
        });
    }
}

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Fetches dashboard statistics
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
    try {
        const data = await fetchWithRetry<DashboardStats>(
            `${config.apiUrl}/api/dashboard/stats`
        );
        return data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);

        // Return fallback data on error
        return {
            total_calls: 0,
            scams_blocked: 0,
            time_saved_minutes: 0,
            current_status: 'idle',
            today_calls: 0,
            block_rate: 0,
            avg_call_duration: 0,
        };
    }
}

/**
 * Fetches recent calls
 */
export async function fetchRecentCalls(limit = 20): Promise<Call[]> {
    try {
        const data = await fetchWithRetry<Call[]>(
            `${config.apiUrl}/api/calls/recent?limit=${limit}`
        );
        return data;
    } catch (error) {
        console.error('Error fetching recent calls:', error);
        return [];
    }
}

/**
 * Fetches a single call by ID
 */
export async function fetchCall(id: string): Promise<Call | null> {
    try {
        const data = await fetchWithRetry<Call>(
            `${config.apiUrl}/api/calls/${id}`
        );
        return data;
    } catch (error) {
        console.error(`Error fetching call ${id}:`, error);
        return null;
    }
}

/**
 * Updates call outcome
 */
export async function updateCallOutcome(
    id: string,
    outcome: 'blocked' | 'passed' | 'screened'
): Promise<boolean> {
    try {
        await fetchWithRetry(
            `${config.apiUrl}/api/calls/${id}`,
            {
                method: 'PATCH',
                body: JSON.stringify({ outcome }),
            }
        );
        return true;
    } catch (error) {
        console.error(`Error updating call ${id}:`, error);
        return false;
    }
}

// ============================================================================
// Export Types
// ============================================================================

export type { DashboardStats, Call, APIError };
