const dotenv = require('dotenv');
const path = require('path');
const { ConfigError } = require('./errors');

// Try to load .env file
const envPath = path.resolve(process.cwd(), '.env');
try {
    dotenv.config({ path: envPath });
} catch (error) {
    console.warn('Warning: .env file not found. Using environment variables directly.');
}

// Validate required environment variables
const requiredEnvVars = {
    GEMINI_API_KEY: 'Google Gemini API Key',
    FB_ACCESS_TOKEN: 'Facebook Access Token',
    FB_PAGE_ID: 'Facebook Page ID'
};

// Check for missing environment variables
Object.entries(requiredEnvVars).forEach(([envVar, description]) => {
    if (!process.env[envVar]) {
        throw new ConfigError(envVar, description);
    }
});

module.exports = {
    // Google Gemini API Key
    geminiApiKey: process.env.GEMINI_API_KEY,

    // Facebook API Credentials
    fbAccessToken: process.env.FB_ACCESS_TOKEN,
    fbPageId: process.env.FB_PAGE_ID,

    // News RSS Feed URL
    newsRssUrl: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen',

    // Cron Schedule (runs every 60 minutes)
    cronSchedule: '*/60 * * * *'
}; 