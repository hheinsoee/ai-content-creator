import type { Env, NewsApiResponse, NewsItem } from '../../types.js';

const NEWS_API_BASE = 'https://gnews.io/api/v4/search';

// Topics relevant to Myanmar audience
// Topics relevant to Myanmar audience (Simplified for better hit rate)
const SEARCH_TOPICS = [
  '"AI tools"',
  '"free AI"',
  '"AI tips"',
  '"free hosting"',
  '"AI for Myanmar"',
  '"AI for Myanmar students"',
];

function getRandomTopics(count: number = 2): string {
  // Pick random topics and join with OR
  const shuffled = [...SEARCH_TOPICS].sort(() => Math.random() - 0.5);
  // Example result: "AI tools" OR "ChatGPT"
  return shuffled.slice(0, count).join(' OR ');
}

export async function fetchAINews(env: Env, count: number = 5): Promise<NewsItem[]> {
  try {
    const query = encodeURIComponent(getRandomTopics(3));
    const url = `${NEWS_API_BASE}?q=${query}&apikey=${env.GNEWS_API_KEY}&max=${count}&lang=en`;
    console.log('Search query:', decodeURIComponent(query));

    console.log('Fetching news from GNews...');
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('News API error:', response.status, errorText);
      return [];
    }

    const data = (await response.json()) as NewsApiResponse;

    if (!data.articles || data.articles.length === 0) {
      console.log('No articles found');
      return [];
    }

    console.log(`Found ${data.articles.length} articles`);
    return data.articles.map((article) => ({
      title: article.title,
      content: article.description,
      url: article.url,
      pubDate: article.publishedAt,
      image: article.image,
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

// Keep for backward compatibility
export async function fetchLatestNews(env: Env): Promise<NewsItem | null> {
  const articles = await fetchAINews(env, 1);
  return articles[0] ?? null;
}
