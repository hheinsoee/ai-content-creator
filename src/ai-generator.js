const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const config = require('./config-loader');

// Initialize Google Gemini
const genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });

// Ensure generated directory exists
const ensureGeneratedDir = () => {
    const dir = path.join(process.cwd(), 'generated');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    return dir;
};

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
    const prompt = `Create a detailed image description for a portrait-oriented image (4:5 aspect ratio) that represents this news: ${newsTitle}. The image should be suitable for social media sharing, with clear details and vibrant colors. Make it visually striking and engaging, optimized for vertical viewing on mobile devices.`;
    return generateText(prompt);
};

// Generate and save image
const generateAndSaveImage = async (description) => {
    const imageResponse = await genAI.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: description,
        config: {
            responseModalities: ["TEXT", "IMAGE"]
        }
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const imagePath = path.join(ensureGeneratedDir(), `image-${timestamp}.png`);

    for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, 'base64');
            fs.writeFileSync(imagePath, buffer);
            console.log('Image saved as:', imagePath);
            return imagePath;
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
        const imagePath = await generateAndSaveImage(imageDescription);

        return {
            text,
            imagePath
        };
    } catch (error) {
        console.error('Error generating content:', error);
        return null;
    }
};

const aiGenerator = {
    generateContent
};

module.exports = aiGenerator; 