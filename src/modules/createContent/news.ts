import type { Env, NewsApiResponse, NewsItem } from '../../types.js';

const NEWS_API_BASE = 'https://gnews.io/api/v4/top-headlines';

export async function fetchLatestNews(env: Env): Promise<NewsItem | null> {
  try {
    const url = `${NEWS_API_BASE}?category=technology&apikey=${env.GNEWS_API_KEY}&max=1&lang=en`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('News API error:', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as NewsApiResponse;

    if (!data.articles || data.articles.length === 0) {
      return null;
    }

    const article = data.articles[0];
    return {
      title: article.title,
      content: article.description,
      url: article.url,
      pubDate: article.publishedAt,
      image: article.image,
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}
