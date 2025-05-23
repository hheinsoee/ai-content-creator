# AI Content Creator

An automated Node.js application that creates and posts news content to Facebook using AI.

## Features

- Fetches latest news from Google News (TOPIC = Technology) RSS feed
- Translates and summarizes news in Burmese using Google Gemini AI
- Generates image descriptions using AI
- Posts content to Facebook automatically
- Runs on a configurable schedule (default: every 6 hours)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure the application:
   - Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Get Facebook API credentials from [Facebook Developers](https://developers.facebook.com/)
   - Update the configuration in `config.js` with your credentials

3. Run the application:
```bash
npm start
```

## Configuration

The application can be configured through the `config.js` file:

- `geminiApiKey`: Your Google Gemini API key
- `fbAccessToken`: Your Facebook access token
- `fbPageId`: Your Facebook page ID
- `newsRssUrl`: The RSS feed URL to fetch news from
- `cronSchedule`: The schedule for running the job (default: every 1 hours)

## Dependencies

- node-cron: For scheduling tasks
- rss-parser: For parsing RSS feeds
- @google/genai: For AI text generation
- facebook-nodejs-business-sdk: For Facebook API integration
- dotenv: For environment variable management
- axios: For HTTP requests

## Note

This is a basic implementation. For production use, you should:
- Add error handling and retry mechanisms
- Implement proper logging
- Add image generation and upload functionality
- Add content moderation
- Implement rate limiting
- Add monitoring and alerting 