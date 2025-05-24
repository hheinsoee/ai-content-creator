import axios from 'axios';
import { config } from './config.js';

class FacebookPoster {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.accessToken = config.fbAccessToken;
        
        // Validate Page ID
        if (!config.fbPageId || !/^\d+$/.test(config.fbPageId)) {
            throw new Error('Invalid Facebook Page ID. It must be a numeric value.');
        }
        this.pageId = config.fbPageId;
        
        // Validate Access Token
        if (!this.accessToken) {
            throw new Error('Facebook Access Token is required');
        }
    }

    async post(content) {
        try {
            if (content.imageData) {
                // Create form data with base64 image
                const formData = new FormData();
                
                // Convert base64 to blob
                const imageBuffer = Buffer.from(content.imageData, 'base64');
                const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
                
                // Append the blob to form data
                formData.append('source', imageBlob, 'image.png');
                formData.append('access_token', this.accessToken);
                formData.append('message', content.text);
                formData.append('published', 'true');

                console.log("Uploading photo with message...");
                const uploadUrl = `${this.baseUrl}/${this.pageId}/photos`;
                
                console.log('Using Page ID:', this.pageId);
                console.log('Upload URL:', uploadUrl);
                
                const uploadResponse = await axios.post(uploadUrl, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                });

                console.log('Posted to Facebook successfully:', uploadResponse.data);
                return uploadResponse.data;
            } else {
                // Text-only post
                const url = `${this.baseUrl}/${this.pageId}/feed`;
                const response = await axios.post(url, {
                    message: content.text,
                    access_token: this.accessToken
                });

                console.log('Posted to Facebook successfully:', response.data.id);
                return response.data;
            }
        } catch (error) {
            console.error('Error posting to Facebook:', error.response?.data || error.message);
            if (error.response?.data?.error) {
                console.error('Facebook API Error:', {
                    code: error.response.data.error.code,
                    message: error.response.data.error.message,
                    type: error.response.data.error.type
                });
            }
            throw error;
        }
    }
}

export const facebookPoster = new FacebookPoster(); 