const facebookPoster = require('./src/facebook-poster');

// Test content
const testContent = {
    text: "မင်္ဂလာပါ။ ဒါဟာ Facebook Posting Test ဖြစ်ပါတယ်။\n\nHello! This is a Facebook Posting Test."
};

// Run the test
console.log('Testing Facebook posting...');
console.log('Test content:', testContent);

facebookPoster.post(testContent)
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
            console.error('- FB_ACCESS_TOKEN: Your Facebook access token');
            console.error('- FB_PAGE_ID: Your Facebook page ID');
        } else {
            console.error('Error details:', error.message);
            if (error.response) {
                console.error('Facebook API Response:', error.response);
            }
        }
        process.exit(1);
    }); 