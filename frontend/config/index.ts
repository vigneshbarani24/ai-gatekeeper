/**
 * Application Configuration
 * Type-safe environment variable access with validation
 */

import { AppConfig } from '@/types';

/**
 * Validates and returns the application configuration
 * Throws an error if required environment variables are missing
 */
function getConfig(): AppConfig {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const elevenLabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const elevenLabsAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const nodeEnv = process.env.NODE_ENV;

    // Validate required environment variables
    if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL environment variable is required');
    }

    if (!elevenLabsApiKey) {
        console.warn('NEXT_PUBLIC_ELEVENLABS_API_KEY is not set. Voice features will be disabled.');
    }

    if (!elevenLabsAgentId) {
        console.warn('NEXT_PUBLIC_ELEVENLABS_AGENT_ID is not set. Voice features will be disabled.');
    }

    const environment = (nodeEnv === 'production' || nodeEnv === 'test')
        ? nodeEnv
        : 'development';

    return {
        apiUrl,
        elevenLabsApiKey: elevenLabsApiKey || '',
        elevenLabsAgentId: elevenLabsAgentId || '',
        environment,
    };
}

// Export singleton configuration
export const config = getConfig();

// Export helper functions
export const isDevelopment = config.environment === 'development';
export const isProduction = config.environment === 'production';
export const isTest = config.environment === 'test';

// Export feature flags
export const features = {
    voiceEnabled: Boolean(config.elevenLabsApiKey && config.elevenLabsAgentId),
    analyticsEnabled: isProduction,
    debugMode: isDevelopment,
};
