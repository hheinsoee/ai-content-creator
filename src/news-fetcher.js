const Parser = require('rss-parser');
const config = require('../config');

// Initialize RSS Parser
const parser = new Parser();

class NewsFetcher {
    async fetchLatestNews() {
        try {
            const feed = await parser.parseURL(config.newsRssUrl);
            return feed.items[0]; // Get the latest news item
        } catch (error) {
            console.error('Error fetching news:', error);
            return null;
        }
    }
}

module.exports = new NewsFetcher(); 