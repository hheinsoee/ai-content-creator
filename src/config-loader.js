import dotenv from 'dotenv';
import { ConfigError } from './errors.js';

// Try to load .env file
try {
    dotenv.config();
} catch (error) {
    console.warn('Warning: .env file not found. Using environment variables directly.');
}

// Validate required environment variables
const requiredEnvVars = {
    GEMINI_API_KEY: 'Google Gemini API Key',
    FB_ACCESS_TOKEN: 'Facebook Access Token',
    FB_PAGE_ID: 'Facebook Page ID',
    GNEWS_API_KEY: 'GNews API Key'
};

// Check for missing environment variables
Object.entries(requiredEnvVars).forEach(([envVar, description]) => {
    if (!process.env[envVar]) {
        throw new ConfigError(envVar, description);
    }
});

export const config = {
    // Google Gemini API Key
    geminiApiKey: process.env.GEMINI_API_KEY,

    // Facebook API Credentials
    fbAccessToken: process.env.FB_ACCESS_TOKEN,
    fbPageId: process.env.FB_PAGE_ID,

    // GNews API Key
    gnewsApiKey: process.env.GNEWS_API_KEY,

    // News API URL
    newsApiUrl: `https://gnews.io/api/v4/top-headlines?category=technology&apikey=${process.env.GNEWS_API_KEY}&max=1`
}; 