import { GoogleGenAI } from '@google/genai';
import { config } from './config.js';

// Initialize Google Gemini
const genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });

// Generate text content
const generateText = async (prompt) => {
    const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
    });
    return response.text;
};

// Generate image description
const generateImageDescription = async (newsTitle) => {
    const prompt = `Create a detailed image description for a portrait-oriented image (4:5 aspect ratio) that represents this news: ${newsTitle}. The image should be suitable for social media sharing, with clear details and vibrant colors. Make it visually striking and engaging.`;
    return generateText(prompt);
};

// Generate image
const generateImage = async (description) => {
    const imageResponse = await genAI.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: description,
        config: {
            responseModalities: ["TEXT", "IMAGE"]
        }
    });

    for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data; // Return base64 image data directly
        }
    }
    return null;
};

// Main content generation function
const generateContent = async (newsItem) => {
    try {
        // Generate Burmese text
        const textPrompt = `Translate and summarize this news in Burmese language in a social media friendly way. Do not include any introductory text, markdown, or formatting. Just provide the direct translation and summary: ${newsItem.title} - ${newsItem.content}`;
        const text = await generateText(textPrompt);

        // Generate image
        const imageDescription = await generateImageDescription(newsItem.title);
        const imageData = await generateImage(imageDescription);

        return {
            text,
            imageData // Return base64 image data instead of file path
        };
    } catch (error) {
        console.error('Error generating content:', error);
        return null;
    }
};

export const aiGenerator = {
    generateContent
}; 