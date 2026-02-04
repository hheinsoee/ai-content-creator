import type { Env, NewsApiResponse, NewsItem } from '../../types.js';

const NEWS_API_BASE = 'https://gnews.io/api/v4/search';

export async function fetchAINews(env: Env, count: number = 5): Promise<NewsItem[]> {
  try {
    const url = `${NEWS_API_BASE}?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+ChatGPT+OR+GPT&apikey=${env.GNEWS_API_KEY}&max=${count}&lang=en&sortby=relevance`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('News API error:', response.status, response.statusText);
      return [];
    }

    const data = (await response.json()) as NewsApiResponse;

    if (!data.articles || data.articles.length === 0) {
      return [];
    }

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
