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

export async function generateImage(env: Env, description: string): Promise<string | null> {
  // Skip image generation if no model configured or model is 'none'
  if (!env.AI_IMAGE_MODEL || env.AI_IMAGE_MODEL === 'none') {
    console.log('Image generation disabled');
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
          content: `Generate an image: ${description}. Style: black and white vector art, simple, minimalist, high contrast, clean lines${env.AI_IMAGE_SIZE ? `, size: ${env.AI_IMAGE_SIZE}` : ''}. Only output the image, no text.`,
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const message = response.choices[0]?.message as any;

    // Check for images array (OpenRouter/Gemini format)
    if (message?.images && Array.isArray(message.images)) {
      for (const img of message.images) {
        if (img?.image_url?.url) {
          const url = img.image_url.url as string;
          // Extract base64 from data URL
          const match = url.match(/data:image\/[^;]+;base64,(.+)/);
          if (match?.[1]) {
            return match[1];
          }
        }
      }
    }

    // Fallback: check content for embedded base64
    const content = message?.content;
    if (content && typeof content === 'string' && content.includes('data:image')) {
      const match = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
      if (match?.[1]) {
        return match[1];
      }
    }

    console.log('No image data found in response');
    return null;
  } catch (error) {
    console.error('Error generating image (skipping):', error instanceof Error ? error.message : error);
    return null;
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

  const articleList = articles
    .map((a, i) => `[${i + 1}] ${a.title}: ${a.content.substring(0, 500)}${a.content.length > 500 ? '...' : ''}`)
    .join('\n');

  const prompt = `You are a Myanmar tech blogger selecting and creating content for Facebook.

ARTICLES:
${articleList}

TASK: Select the best article for Myanmar Facebook audience and create content.

Respond in this EXACT JSON format (no markdown, no code blocks):
{"selected":1,"myanmar":"မြန်မာဘာသာဖြင့် ရေးထားသော ပို့စ်","image":"English image prompt"}

Rules:
- "selected": number 1-${articles.length} (most engaging article)
- "myanmar": 2-3 paragraphs in Myanmar language with 2-3 emojis, no markdown
- "image": Brief English prompt for AI image (futuristic, tech, blue/purple colors)

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
    const imageData = await generateImage(env, 'Futuristic AI technology visualization');

    return {
      text,
      imageData: imageData ?? undefined,
    };
  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}
