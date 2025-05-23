const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Initialize Google Gemini
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

class AIGenerator {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        this.imageModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async generateContent(newsItem) {
        try {
            // Generate Burmese text
            const prompt = `Translate and summarize this news in Burmese language in a social media friendly way: ${newsItem.title} - ${newsItem.content}`;
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();

            // Generate image
            const imagePrompt = `Create a detailed image description for a 600x600 image that represents this news: ${newsItem.title}. The image should be suitable for social media sharing.`;
            const imageResult = await this.model.generateContent(imagePrompt);
            const imageDescription = imageResult.response.text();

            // Generate the actual image using Gemini's image generation
            const imageGenerationResult = await this.imageModel.generateContent({
                contents: [{
                    parts: [{
                        text: `Generate a 600x600 image based on this description: ${imageDescription}`
                    }]
                }]
            });

            const generatedImage = imageGenerationResult.response.candidates[0].content.parts[0].inlineData.data;

            return {
                text,
                imageDescription,
                image: generatedImage
            };
        } catch (error) {
            console.error('Error generating content:', error);
            return null;
        }
    }
}

module.exports = new AIGenerator(); 