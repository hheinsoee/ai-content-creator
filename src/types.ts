export interface Env {
  GEMINI_API_KEY: string;
  FB_ACCESS_TOKEN: string;
  FB_PAGE_ID: string;
  GNEWS_API_KEY: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  image: string;
}

export interface NewsApiResponse {
  articles: NewsArticle[];
}

export interface NewsItem {
  title: string;
  content: string;
  url: string;
  pubDate: string;
  image: string;
}

export interface GeneratedContent {
  text: string;
  imageData?: string;
}

export interface FacebookPostResult {
  id: string;
  post_id?: string;
}

export interface FacebookError {
  error: {
    code: number;
    message: string;
    type: string;
  };
}
