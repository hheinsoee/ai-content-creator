# AI Content Creator

Automated AI news content creator that fetches tech news, generates Myanmar language content with AI-generated images, and posts to Facebook pages.

## Features

- Fetches AI/tech news from GNews API
- Generates Myanmar language content using AI (OpenAI-compatible API)
- Generates images using AI (Gemini image models)
- Posts to Facebook pages with images and hashtags
- Scheduled posting via Cloudflare Workers cron
- Custom AI gateway support (OpenRouter, local gateway, etc.)

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **AI Provider**: OpenAI-compatible API (supports Gemini, OpenRouter, custom gateways)
- **News Source**: GNews API
- **Social**: Facebook Graph API

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy `.dev.vars.example` to `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:

```bash
# AI Provider Config (OpenAI-compatible)
AI_API_KEY=your_api_key
AI_TEXT_MODEL=google/gemini-2.5-flash
AI_IMAGE_MODEL=google/gemini-2.5-flash-image
AI_API_ENDPOINT=https://your-ai-gateway.com/v1

# Facebook Config
FB_ACCESS_TOKEN=your_page_access_token
FB_PAGE_ID=your_numeric_page_id

# News Config
GNEWS_API_KEY=your_gnews_api_key
```

### 3. Facebook Setup

1. Create app at [developers.facebook.com](https://developers.facebook.com)
2. Add "Facebook Login for Business" product
3. Go to **Use cases** → **Manage everything on your Page** → **Customize**
4. Add `pages_manage_posts` permission
5. Generate a **Page Access Token** (not User token)
6. Get your numeric Page ID from Page settings

**Required permissions:**
- `pages_manage_posts` - for posting content
- `pages_read_engagement` - for reading page data

### 4. AI Gateway Setup

The app uses OpenAI-compatible API format. You can use:

- **OpenRouter**: `https://openrouter.ai/api/v1`
- **Google AI Studio**: `https://generativelanguage.googleapis.com/v1beta/openai/`
- **Custom gateway**: Your own proxy server

## Development

```bash
# Run local dev server
pnpm dev

# Test scheduled task locally
pnpm dev --test-scheduled

# Run tests
pnpm test:run

# Test specific features
pnpm test:run text    # Test text generation
pnpm test:run image   # Test image generation
pnpm test:run news    # Test news fetching
pnpm test:run select  # Test article selection
pnpm test:run token   # Test Facebook token
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Set secrets
wrangler secret put AI_API_KEY
wrangler secret put AI_API_ENDPOINT
wrangler secret put FB_ACCESS_TOKEN
wrangler secret put FB_PAGE_ID
wrangler secret put GNEWS_API_KEY

# Deploy
pnpm deploy
```

### Manual trigger

Visit `https://your-worker.workers.dev/run` to trigger content creation manually.

## Post Format

Generated posts include:

```
[Myanmar language content about the news]

#AI #ArtificialIntelligence #Tech #Innovation #Myanmar #နည်းပညာ

🔗 https://source-article-url.com
```

## Project Structure

```
src/
├── index.ts              # Main worker entry
├── types.ts              # TypeScript types
└── modules/
    ├── createContent/
    │   ├── ai.ts         # AI text/image generation
    │   ├── news.ts       # News fetching
    │   └── index.ts      # Content creation pipeline
    └── publishContent/
        ├── facebook.ts   # Facebook API
        └── index.ts      # Publishing pipeline
```

## Troubleshooting

### Token expired
Facebook Page tokens can expire. Regenerate from Graph API Explorer.

### Missing permissions
Ensure your app has `pages_manage_posts` permission and you're using a **Page token** (not User token).

### Image not generated
Check if your AI gateway supports image generation via chat completions. Some models return images in `message.images[]` array.

### Connection error in wrangler
Cloudflare Workers can't access `localhost`. Use production gateway URL in `.dev.vars`.

## License

MIT