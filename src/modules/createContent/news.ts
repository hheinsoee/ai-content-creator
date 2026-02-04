import type { Env, NewsApiResponse, NewsItem } from '../../types.js';

const NEWS_API_BASE = 'https://gnews.io/api/v4/search';

export async function fetchAINews(env: Env, count: number = 5): Promise<NewsItem[]> {
  try {
    const query = encodeURIComponent('artificial intelligence OR AI OR machine learning');
    const url = `${NEWS_API_BASE}?q=${query}&apikey=${env.GNEWS_API_KEY}&max=${count}&lang=en`;

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
