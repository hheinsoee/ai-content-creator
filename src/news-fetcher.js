import { config } from './config.js';

class NewsFetcher {
    async fetchLatestNews() {
        try {
            const response = await fetch(config.newsApiUrl);
            const data = await response.json();
            console.log(config.newsApiUrl);
            if (!data.articles || data.articles.length === 0) {
                return null;
            }

            const article = data.articles[0];
            return {
                title: article.title,
                content: article.description,
                link: article.url,
                pubDate: article.publishedAt
            };
        } catch (error) {
            console.error('Error fetching news:', error);
            return null;
        }
    }
}

export const newsFetcher = new NewsFetcher(); 