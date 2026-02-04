import type { Env, GeneratedContent, NewsItem } from '../../types.js';
import { fetchAINews, fetchLatestNews } from './news.js';
import { selectAndGenerate, generateImage } from './ai.js';

export interface ContentResult {
  content: GeneratedContent;
  source: NewsItem;
}

export async function createContent(env: Env): Promise<ContentResult | null> {
  // Step 1: Fetch 5 AI news articles
  console.log('Fetching AI news articles...');
  const articles = await fetchAINews(env, 5);

  if (articles.length === 0) {
    console.log('No AI news articles found');
    return null;
  }

  console.log(`Found ${articles.length} articles`);

  // Step 2: Select best article AND generate Myanmar content (1 API call)
  console.log('Selecting & generating content...');
  const result = await selectAndGenerate(env, articles);

  if (!result) {
    console.log('Failed to select and generate content');
    return null;
  }

  console.log('Selected:', result.article.title);

  // Step 3: Generate image (1 API call)
  console.log('Generating image...');
  const imageData = await generateImage(env, result.content.imagePrompt);

  // Add hashtags and source URL to the post
  const hashtags = '#AI #ArtificialIntelligence #Tech #Innovation #Myanmar #နည်းပညာ';
  const fullText = `${result.content.myanmarText}\n\n${hashtags}\n\n🔗 ${result.article.url}`;

  const content: GeneratedContent = {
    text: fullText,
    imageData: imageData ?? undefined,
  };

  console.log('Content generated successfully');
  return { content, source: result.article };
}

export { fetchAINews, fetchLatestNews };
export { selectAndGenerate, generateText, generateImage, selectBestArticle, generateAIContent } from './ai.js';