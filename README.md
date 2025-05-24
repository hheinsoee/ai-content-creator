# AI Content Creator

An automated content creation and posting tool that generates and shares content to Facebook pages.

## Features

- AI-powered content generation using Google Gemini
- Automated Facebook page posting
- News fetching from GNews API
- Scheduled content posting
- Cloudflare Workers deployment

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Facebook Developer Account
- A Facebook Page
- Google Gemini API Key
- GNews API Key
- Cloudflare Account (for deployment)

## Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ai-content-creator
```

2. Install dependencies:
```bash
npm install
```

3. Configure the application:
   - Copy `config.example.js` to `config.js` in the `src` directory
   - Update the configuration values in `config.js`

## Configuration

All configuration is managed through `src/config.js`. Copy `config.example.js` to `config.js` and update the values:

```javascript
export const config = {
    // Google Gemini API Key
    geminiApiKey: "",

    // Facebook API Credentials
    fbAccessToken: "",
    fbPageId: "000000000000000",

    // News API URL
    newsApiUrl: `https://gnews.io/api/v4/top-headlines?category=technology&apikey=YOUR_API_KEY&max=1`
};
```

## API Setup

1. **Google Gemini API**
   - Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Add the API key to `config.js`

2. **Facebook Setup**
   - Create a Facebook Developer Account at [developers.facebook.com](https://developers.facebook.com)
   - Create a new app in the Facebook Developer Console
   - Add the Facebook Pages API to your app
   - Generate a Page Access Token with the following permissions:
     - `pages_manage_posts`
     - `pages_read_engagement`
   - Get your Facebook Page ID from your page's settings

3. **GNews API**
   - Sign up for an API key at [GNews](https://gnews.io/)
   - Add your API key to the `newsApiUrl` in `config.js`

## Local Development

1. Start the development server:
```bash
npm run dev
```

2. Test the Facebook posting functionality:
```bash
npm run test
```

## Deployment to Cloudflare Workers

1. Install Wrangler (Cloudflare Workers CLI):
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Deploy to Cloudflare Workers:
```bash
wrangler deploy
```

## Error Handling

The application includes comprehensive error handling for:
- Invalid API credentials
- API rate limits
- Permission issues
- Content generation failures

## Troubleshooting

Common issues and solutions:

1. **400 Bad Request Error**
   - Verify your Facebook access token is valid
   - Check if the token has required permissions
   - Ensure the page ID is correct

2. **API Rate Limiting**
   - GNews has API call limits
   - Google Gemini has usage quotas
   - Facebook has API call limits
   - Monitor your API usage

3. **Content Generation Issues**
   - Check Gemini API key validity
   - Verify news API key and endpoint
   - Ensure proper error handling

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 