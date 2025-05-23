const newsFetcher = require('./src/news-fetcher');
const aiGenerator = require('./src/ai-generator');
const facebookPoster = require('./src/facebook-poster');
const Scheduler = require('./src/scheduler');

async function main() {
    console.log('Starting content creation process...');
    
    try {
        // Fetch latest news
        const newsItem = await newsFetcher.fetchLatestNews();
        if (!newsItem) {
            console.log('No news items found');
            return;
        }

        console.log({origynal_content:newsItem});
        // Generate content
        const content = await aiGenerator.generateContent(newsItem);
        if (!content) {
            console.log('Failed to generate content');
            return;
        }
        console.log({generated_content:content});
        // Post to Facebook
        await facebookPoster.post(content);
    } catch (error) {
        console.error('Error in main process:', error);
    }
}

module.exports = { main };

