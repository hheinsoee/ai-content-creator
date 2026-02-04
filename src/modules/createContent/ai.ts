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

export async function generateAIContent(
  env: Env,
  newsItem: NewsItem
): Promise<GeneratedContent | null> {
  try {
    const textPrompt = `Translate and summarize this news in Burmese language in a social media friendly way. Do not include any introductory text, markdown, or formatting. Just provide the direct translation and summary: ${newsItem.title} - ${newsItem.content}`;
    const text = await generateText(env, textPrompt);

    const imageDescPrompt = `Create a detailed image description for a portrait-oriented image (4:5 aspect ratio) that represents this news: ${newsItem.title}. The image should be suitable for social media sharing, with clear details and vibrant colors. Make it visually striking and engaging.`;
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
