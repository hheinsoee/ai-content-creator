import { facebookPoster } from './src/facebook-poster.js';
import { aiGenerator } from './src/ai-generator.js';

// Test content
const testNews = {
    title: "AI Technology Breakthrough",
    content: "Scientists have made a significant breakthrough in artificial intelligence technology, enabling more efficient and accurate natural language processing."
};

// Run the test
console.log('Testing AI content generation and Facebook posting...');
console.log('Test news:', testNews);

// First generate content
aiGenerator.generateContent(testNews)
    .then(content => {
        console.log('\nGenerated content:', {
            text: content.text,
            hasImage: !!content.imageData
        });
        
        // Then post to Facebook
        return facebookPoster.post(content);
    })
    .then(post => {
        console.log('\nTest completed successfully!');
        console.log('Post ID:', post.id);
        process.exit(0);
    })
    .catch(error => {
        console.error('\nTest failed!');
        if (error.name === 'ConfigError') {
            console.error('\nConfiguration Error:');
            console.error(`Missing environment variable: ${error.envVar}`);
            console.error(`Description: ${error.description}`);
            console.error('\nPlease set the required environment variables:');
            console.error('- GEMINI_API_KEY: Your Google Gemini API key');
            console.error('- FB_ACCESS_TOKEN: Your Facebook access token');
            console.error('- FB_PAGE_ID: Your Facebook page ID');
        } else {
            console.error('Error details:', error.message);
            if (error.response) {
                console.error('API Response:', error.response.data);
            }
        }
        process.exit(1);
    }); 