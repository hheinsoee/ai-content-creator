# AI Content Creator - Agent Memory

## Project Overview

Automated AI news content creator that posts to Facebook every 4 hours.

## Pipeline Flow

```
1. Validate Facebook Token  → Stop if invalid
2. Fetch 5 AI news articles → GNews API
3. Select best + Generate   → 1 Gemini API call (optimized)
4. Generate image           → 1 Imagen API call
5. Post to Facebook         → Facebook Graph API
6. Add source comment       → Facebook Graph API
```

## Configuration (.dev.vars)

```bash
# AI Provider
AI_API_KEY=xxx              # Google Gemini API key
AI_TEXT_MODEL=gemini-2.0-flash
AI_IMAGE_MODEL=imagen-3.0-generate-002

# Facebook
FB_ACCESS_TOKEN=xxx         # Page access token (check expiry!)
FB_PAGE_ID=xxx              # Numeric page ID

# News
GNEWS_API_KEY=xxx           # GNews API key
```

## Project Structure

```
src/
├── index.ts                 # Worker entry, pipeline orchestration
├── types.ts                 # TypeScript interfaces
└── modules/
    ├── index.ts             # Module exports
    ├── createContent/
    │   ├── index.ts         # createContent()
    │   ├── ai.ts            # selectAndGenerate(), generateImage()
    │   └── news.ts          # fetchAINews()
    └── publishContent/
        ├── index.ts         # uploadContent()
        └── facebook.ts      # validateToken(), postToFacebook(), addComment()
```

## Commands

```bash
pnpm dev          # Local development
pnpm deploy       # Deploy to Cloudflare
pnpm typecheck    # Type check
pnpm test:run     # Run tests
```

## Test Commands

```bash
pnpm test:run news     # Fetch AI news
pnpm test:run select   # Select best article
pnpm test:run text     # Test text generation
pnpm test:run image    # Test image generation
pnpm test:run token    # Check Facebook token
pnpm test:run post     # Create test post
```

## Token Management

Facebook tokens expire. To get a long-lived page token:

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Generate user token with `pages_manage_posts` permission
3. Exchange for long-lived token:
   ```
   GET /oauth/access_token?grant_type=fb_exchange_token&...
   ```
4. Get page token:
   ```
   GET /me/accounts
   ```

Page tokens from long-lived user tokens **never expire**.

## API Optimization

- Combined `selectAndGenerate()` does selection + translation + image prompt in **1 API call**
- Total Gemini calls: **2** (text + image)
- Token validation runs **before** any content generation

## Schedule

- Cron: `0 */4 * * *` (every 4 hours at minute 0)
- Runs on: Cloudflare Workers

## Content Style

- Language: Myanmar (Burmese)
- Topic: AI/Technology news
- Format: 2-3 paragraphs with emojis
- Image: Futuristic AI visualization (4:3 aspect ratio)
