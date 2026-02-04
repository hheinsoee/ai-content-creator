import type { Env, GeneratedContent, NewsItem } from '../../types.js';
import { fetchLatestNews } from './news.js';
import { generateAIContent } from './ai.js';

export interface ContentResult {
  content: GeneratedContent;
  source: NewsItem;
}

export async function createContent(env: Env): Promise<ContentResult | null> {
  console.log('Fetching latest news...');
  const newsItem = await fetchLatestNews(env);

  if (!newsItem) {
    console.log('No news items found');
    return null;
  }

  console.log('News found:', newsItem.title);

  console.log('Generating AI content...');
  const content = await generateAIContent(env, newsItem);

  if (!content) {
    console.log('Failed to generate content');
    return null;
  }

  console.log('Content generated successfully');
  return { content, source: newsItem };
}

export { fetchLatestNews, generateAIContent };
export { generateText, generateImage } from './ai.js';
