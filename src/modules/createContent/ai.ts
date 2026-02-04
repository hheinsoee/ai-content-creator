import { GoogleGenAI } from '@google/genai';
import type { Env, NewsItem, GeneratedContent } from '../../types.js';

function createClient(env: Env): GoogleGenAI {
  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

export async function generateText(env: Env, prompt: string): Promise<string> {
  const client = createClient(env);
  const response = await client.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  return response.text ?? '';
}

export async function generateImage(env: Env, description: string): Promise<string | null> {
  try {
    const client = createClient(env);
    const response = await client.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: description,
      config: {
        numberOfImages: 1,
        aspectRatio: '4:3',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0];
      if (image.image?.imageBytes) {
        return image.image.imageBytes;
      }
    }
    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

export async function selectBestArticle(env: Env, articles: NewsItem[]): Promise<NewsItem | null> {
  if (articles.length === 0) return null;
  if (articles.length === 1) return articles[0];

  const articleList = articles
    .map((a, i) => `${i + 1}. Title: ${a.title}\n   Description: ${a.content}`)
    .join('\n\n');

  const prompt = `You are a social media content curator for a Myanmar tech audience.

Below are ${articles.length} AI/technology news articles. Select the ONE best article for a Facebook post based on:
- Most interesting and engaging for general audience
- Most relevant AI/tech breakthrough or news
- Has potential for good discussion
- Avoids overly technical or niche topics

Articles:
${articleList}

Reply with ONLY the number (1-${articles.length}) of the best article. Nothing else.`;

  try {
    const response = await generateText(env, prompt);
    const choice = parseInt(response.trim(), 10);

    if (choice >= 1 && choice <= articles.length) {
      console.log(`AI selected article #${choice}: ${articles[choice - 1].title}`);
      return articles[choice - 1];
    }

    console.log('Invalid AI response, using first article');
    return articles[0];
  } catch (error) {
    console.error('Error selecting best article:', error);
    return articles[0];
  }
}

export async function generateAIContent(
  env: Env,
  newsItem: NewsItem
): Promise<GeneratedContent | null> {
  try {
    const textPrompt = `You are a Myanmar tech blogger. Translate and summarize this AI news for Myanmar Facebook audience.

Rules:
- Write in Myanmar (Burmese) language
- Make it engaging and easy to understand
- Add 2-3 relevant emojis
- Keep it concise (2-3 paragraphs)
- No markdown formatting
- No introductory phrases like "Here is..."

News: ${newsItem.title}
Details: ${newsItem.content}`;

    const text = await generateText(env, textPrompt);

    const imageDescPrompt = `Create a detailed image description for a social media post about this AI news: "${newsItem.title}".
The image should be:
- Modern and futuristic tech aesthetic
- 4:5 portrait aspect ratio
- Vibrant colors (blues, purples, cyans)
- Abstract AI/technology visualization
- Suitable for Facebook
- No text in the image`;

    const imageDescription = await generateText(env, imageDescPrompt);
    const imageData = await generateImage(env, imageDescription);

    return {
      text,
      imageData: imageData ?? undefined,
    };
  } catch (error) {
    console.error('Error generating content:', error);
    return null;
  }
}
