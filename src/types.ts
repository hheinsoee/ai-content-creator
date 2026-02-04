export interface Env {
  // AI Provider Config
  AI_API_KEY: string;
  AI_API_ENDPOINT?: string; // Optional: for custom endpoints
  AI_TEXT_MODEL: string;
  AI_IMAGE_MODEL: string;

  // Facebook Config
  FB_ACCESS_TOKEN: string;
  FB_PAGE_ID: string;

  // News Config
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

export interface TokenDebugResponse {
  data?: {
    is_valid: boolean;
    expires_at?: number;
    scopes?: string[];
  };
  error?: {
    message: string;
    code: number;
  };
}
