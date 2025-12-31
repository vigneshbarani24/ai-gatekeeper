/**
 * Shared TypeScript Type Definitions
 * Centralized type definitions for the AI Gatekeeper application
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface DashboardStats {
    total_calls: number;
    scams_blocked: number;
    time_saved_minutes: number;
    current_status: 'idle' | 'active' | 'blocked' | 'emergency';
    today_calls: number;
    block_rate: number;
    avg_call_duration: number;
}

export interface Call {
    id: string;
    caller_number: string;
    caller_name?: string;
    intent: string;
    scam_score: number;
    created_at: string;
    duration: number;
    outcome: 'blocked' | 'passed' | 'screened';
    transcript?: string;
    reason?: string;
}

export interface Contact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    is_whitelisted: boolean;
    created_at: string;
}

// ============================================================================
// API Error Types
// ============================================================================

export interface APIError {
    message: string;
    code: string;
    status: number;
    details?: Record<string, unknown>;
}

export class APIException extends Error {
    code: string;
    status: number;
    details?: Record<string, unknown>;

    constructor(error: APIError) {
        super(error.message);
        this.name = 'APIException';
        this.code = error.code;
        this.status = error.status;
        this.details = error.details;
    }
}

// ============================================================================
// Component Prop Types
// ============================================================================

export interface VoiceOrbProps {
    status: 'idle' | 'active' | 'blocked' | 'emergency';
    callsBlocked: number;
    timeSaved: number;
}

export interface CallCardProps {
    call: Call;
    onClick?: () => void;
    className?: string;
}

export interface StatsCardProps {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
    value: string | number;
    color?: string;
    delay?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type AsyncState<T> = {
    data: T | null;
    loading: boolean;
    error: APIError | null;
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// ============================================================================
// Configuration Types
// ============================================================================

export interface AppConfig {
    apiUrl: string;
    elevenLabsApiKey: string;
    elevenLabsAgentId: string;
    environment: 'development' | 'production' | 'test';
}

// ============================================================================
// Form Types
// ============================================================================

export interface ContactFormData {
    name: string;
    phone: string;
    email?: string;
}

export interface SettingsFormData {
    notifications_enabled: boolean;
    voice_enabled: boolean;
    scam_threshold: number;
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
