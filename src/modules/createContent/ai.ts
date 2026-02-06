import OpenAI from 'openai';
import type { Env, NewsItem, GeneratedContent } from '../../types.js';

const DEFAULT_OPENAI_ENDPOINT = 'https://ai-gateway-api-production.up.railway.app/v1';

function createOpenAIClient(env: Env): OpenAI {
  return new OpenAI({
    apiKey: env.AI_API_KEY,
    baseURL: env.AI_API_ENDPOINT || DEFAULT_OPENAI_ENDPOINT,
  });
}

export async function generateText(env: Env, prompt: string): Promise<string> {
  const client = createOpenAIClient(env);
  const response = await client.chat.completions.create({
    model: env.AI_TEXT_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.choices[0]?.message?.content ?? '';
}

export async function generateImage(env: Env, description: string, originalImageUrl?: string): Promise<string | null> {
  // Use original image if no model configured or model is 'none'
  if (!env.AI_IMAGE_MODEL || env.AI_IMAGE_MODEL === 'none') {
    if (originalImageUrl) {
      console.log('Using original image from news article');
      try {
        const response = await fetch(originalImageUrl);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          return base64;
        }
      } catch (e) {
        console.error('Failed to fetch original image:', e);
      }
    }
    console.log('No image available');
    return null;
  }

  try {
    const client = createOpenAIClient(env);

    // Use chat completions for image generation (Gemini/GPT image models)
    const response = await client.chat.completions.create({
      model: env.AI_IMAGE_MODEL,
      messages: [
        {
          role: 'user',
          content: `Generate an image: ${description}${env.AI_IMAGE_SIZE ? `. Size: ${env.AI_IMAGE_SIZE}` : ''}. Only output the image, no text.`,
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = response.choices[0]?.message as any;
    let imageData: string | null = null;

    // Check for images array (OpenRouter/Gemini format)
    if (message?.images && Array.isArray(message.images)) {
      for (const img of message.images) {
        if (img?.image_url?.url) {
          const url = img.image_url.url as string;
          // Extract base64 from data URL
          const match = url.match(/data:image\/[^;]+;base64,(.+)/);
          if (match?.[1]) {
            imageData = match[1];
            break;
          }
        }
      }
    }

    // Fallback: check content for embedded base64
    if (!imageData) {
      const content = message?.content;
      if (content && typeof content === 'string' && content.includes('data:image')) {
        const match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
        if (match?.[1]) {
          imageData = match[1];
        }
      }
    }

    if (!imageData) {
      console.log('No image data found in response');
      return null;
    }

    // Verify image data before upload
    if (env.BUCKET) {
      try {
        const imageBuffer = Uint8Array.from(atob(imageData), (c) => c.charCodeAt(0));
        const key = `images/${Date.now()}-${crypto.randomUUID()}.png`;
        await env.BUCKET.put(key, imageBuffer, {
          httpMetadata: { contentType: 'image/png' },
        });
        console.log(`Image uploaded to R2: ${key}`);
      } catch (uploadError) {
        console.error('Error uploading to R2:', uploadError);
        // Continue even if upload fails
      }
    }

    return imageData;
  } catch (error) {
    console.error('Error generating image (skipping):', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function markArticleAsPosted(env: Env, url: string, title?: string): Promise<void> {
  try {
    if (env.DB) {
      await env.DB.prepare(
        'INSERT INTO posted_articles (url, title, posted_at) VALUES (?, ?, ?)'
      )
        .bind(url, title || '', Date.now())
        .run();
      console.log(`Marked article as posted: ${url}`);
    }
  } catch (error) {
    console.warn(`Failed to mark article as posted: ${url}`, error);
  }
}

// Combined: Select best article AND generate content in ONE call
interface SelectAndGenerateResult {
  selectedIndex: number;
  myanmarText: string;
  imagePrompt: string;
}

export async function selectAndGenerate(
  env: Env,
  articles: NewsItem[]
): Promise<{ article: NewsItem; content: SelectAndGenerateResult } | null> {
  if (articles.length === 0) return null;

  // Articles are already filtered by caller
  const articleList = articles
    .map((a, i) => `[${i + 1}] ${a.title} - ${a.content}`)
    .join('\n');

  const prompt = `You are a funny Myanmar tech blogger who writes viral Facebook posts with jokes and memes.

ARTICLES:
${articleList}

TASK: Pick the most interesting article for Myanmar people and write a fun, meme-style post.

Respond in this EXACT JSON format (no markdown, no code blocks):
{"selected":1,"myanmar":"မြန်မာဘာသာဖြင့် ရေးထားသော ပို့စ်","image":"English image prompt"}

SELECTION CRITERIA (pick article that is):
- **PRIORITY #1**: FREE stuff! (Free Tier, Free API, Open Source, No Credit Card).
- Practical & useful for daily life (jobs, money, education, health).
- Easy to understand (not too technical).
- Relatable to Myanmar people's situations.
- Has meme/joke potential.

WRITING STYLE for "myanmar" field:
- **Tone**: Super friendly, enthusiastic, and "Tech Bro" style (casual tea shop talk).
- Start with a catchy hook: "Hey guys! 👋", "ဒီနေ့တော့ ရှယ်ပဲ...", "Techno fan လေးတို့ရေ..."
- Essential Slang: Use "Bro", "Sayar", "Koe", "See", "Ha", "Bya" naturally.
- **Humor & Memes**: 
  - Make fun of how lazy we are and how AI helps.
  - Relate to local struggles (internet speed, VPN usage, electricity).
  - **Freebie Lover**: Always ask "Free လား?", "Credit card လိုလား?". Hype up anything that is FREE.
  - Use "Meme" humor: "Pov: You trying to code...", "That one friend who...", "Me vs AI...".
- **Structure**:
  1. 😲 Shocking/Funny opening.
  2. 🤓 The Tech Info (Explain it simply like you're talking to a non-tech friend).
  3. 🤑 ** The "Free" Verdict**: Explicitly say if it's free or paid.
  4. 😂 The Joke/Opinion (Why this matters to us in Myanmar).
  5. 🗣️ Engagement question.
- Use 5+ emojis to make it pop (🔥🚀🤯🫡🤣🤖).
- Keep it under 3 paragraphs but make them punchy.
- NO markdown, NO hashtags.

"image" field: Brief English prompt for meme-style or eye-catching image

JSON only:`;

  try {
    const response = await generateText(env, prompt);

    // Clean response - remove markdown code blocks if present
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    }

    const result = JSON.parse(jsonStr);
    const idx = (result.selected || 1) - 1;
    const selectedArticle = articles[Math.min(Math.max(idx, 0), articles.length - 1)];

    console.log(`Selected article #${idx + 1}: ${selectedArticle.title}`);

    return {
      article: selectedArticle,
      content: {
        selectedIndex: idx,
        myanmarText: result.myanmar || '',
        imagePrompt: result.image || 'Futuristic AI technology visualization',
      },
    };
  } catch (error) {
    console.error('Error in selectAndGenerate:', error);
    // Fallback: use first article with simple content
    return {
      article: articles[0],
      content: {
        selectedIndex: 0,
        myanmarText: articles[0].title,
        imagePrompt: 'Futuristic AI technology visualization, black and white vector art',
      },
    };
  }
}

// Legacy functions for backward compatibility
export async function selectBestArticle(env: Env, articles: NewsItem[]): Promise<NewsItem | null> {
  const result = await selectAndGenerate(env, articles);
  return result?.article ?? null;
}

export async function generateAIContent(
  env: Env,
  newsItem: NewsItem
): Promise<GeneratedContent | null> {
  try {
    const textPrompt = `Translate this AI news to Myanmar language for Facebook (2-3 paragraphs, 2-3 emojis, no markdown):
${newsItem.title}: ${newsItem.content}`;

    const text = await generateText(env, textPrompt);
    const imageData = await generateImage(env, newsItem.image);

    return {
      text,
      imageData: imageData ?? undefined,
    };
  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}
