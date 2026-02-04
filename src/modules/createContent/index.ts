import type { Env, GeneratedContent, NewsItem } from '../../types.js';
import { fetchAINews, fetchLatestNews } from './news.js';
import { generateAIContent, selectBestArticle } from './ai.js';

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

  // Step 2: Use AI to select the best article
  console.log('Selecting best article...');
  const bestArticle = await selectBestArticle(env, articles);

  if (!bestArticle) {
    console.log('Failed to select article');
    return null;
  }

  console.log('Selected:', bestArticle.title);

  // Step 3: Generate Myanmar content
  console.log('Generating Myanmar content...');
  const content = await generateAIContent(env, bestArticle);

  if (!content) {
    console.log('Failed to generate content');
    return null;
  }

  console.log('Content generated successfully');
  return { content, source: bestArticle };
}

export { fetchAINews, fetchLatestNews };
export { generateAIContent, selectBestArticle, generateText, generateImage } from './ai.js';
