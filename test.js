const { main } = require('./src/index');

// Run the main function once for testing
console.log('Running test...');
main()
    .then(() => {
        console.log('Test completed successfully');
        process.exit(0);
    })
    .catch(error => {
        if (error.name === 'ConfigError') {
            console.error('\nConfiguration Error:');
            console.error(`Missing environment variable: ${error.envVar}`);
            console.error(`Description: ${error.description}`);
            console.error('\nPlease set the required environment variables in one of these ways:');
            console.error('1. Create a .env file in the project root with:');
            console.error(`   ${error.envVar}=your_value_here`);
            console.error('2. Set the environment variable directly:');
            console.error(`   export ${error.envVar}=your_value_here`);
            console.error('\nRequired environment variables:');
            console.error('- GEMINI_API_KEY: Your Google Gemini API key');
            console.error('- FB_ACCESS_TOKEN: Your Facebook access token');
            console.error('- FB_PAGE_ID: Your Facebook page ID');
        } else {
            console.error('Test failed:', error);
        }
        process.exit(1);
    }); 