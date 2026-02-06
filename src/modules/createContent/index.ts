import type { Env, GeneratedContent, NewsItem } from '../../types.js';
import { fetchAINews, fetchLatestNews } from './news.js';
import { selectAndGenerate, generateImage } from './ai.js';

export interface ContentResult {
  content: GeneratedContent;
  source: NewsItem;
}

export async function createContent(env: Env): Promise<ContentResult | null> {
  // Step 1: Fetch 20 AI news articles
  console.log('Fetching AI news articles...');
  const articles = await fetchAINews(env, 20);

  if (articles.length === 0) {
    console.log('No AI news articles found');
    return null;
  }

  // Step 1.5: Filter out already posted articles
  let newArticles = articles;
  if (env.DB) {
    try {
      const { results } = await env.DB.prepare('SELECT url FROM posted_articles').all();
      const postedUrls = new Set(results.map((r: any) => r.url));
      newArticles = articles.filter((a) => !postedUrls.has(a.url));
      console.log(`Filtered: ${articles.length} total -> ${newArticles.length} new articles`);
    } catch (e) {
      console.error('Error checking DB:', e);
    }
  }

  if (newArticles.length === 0) {
    console.log('All articles have been posted already');
    return null;
  }

  console.log(`Found ${newArticles.length} new articles`);

  // Step 2: Select best article AND generate Myanmar content (1 API call)
  console.log('Selecting & generating content...');
  const result = await selectAndGenerate(env, newArticles);

  if (!result) {
    console.log('Failed to select and generate content');
    return null;
  }

  console.log('Selected:', result.article.title);

  // Step 3: Generate image (1 API call) or use original
  console.log('Generating image...');
  const imageData = await generateImage(env, result.content.imagePrompt, result.article.image);

  // Add hashtags and source URL to the post
  const hashtags = '#AI #နည်းပညာ #TechMyanmar #AIMyanmar #မြန်မာ';
  const fullText = `${result.content.myanmarText}\n\n${hashtags}`;

  const content: GeneratedContent = {
    text: fullText,
    imageData: imageData ?? undefined,
  };

  console.log('Content generated successfully');
  return { content, source: result.article };
}

export { fetchAINews, fetchLatestNews };
export { selectAndGenerate, generateText, generateImage, selectBestArticle, generateAIContent, markArticleAsPosted } from './ai.js';