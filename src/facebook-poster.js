import axios from 'axios';
import FormData from 'form-data';
import { config } from './config-loader.js';

class FacebookPoster {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.accessToken = config.fbAccessToken;
        this.pageId = config.fbPageId;
    }

    async post(content) {
        try {
            if (content.imageData) {
                // Create form data with base64 image
                const formData = new FormData();
                
                // Convert base64 to buffer
                const imageBuffer = Buffer.from(content.imageData, 'base64');
                
                // Append the buffer directly to form data
                formData.append('source', imageBuffer, {
                    filename: 'image.png',
                    contentType: 'image/png'
                });
                
                formData.append('access_token', this.accessToken);
                formData.append('message', content.text);
                formData.append('published', 'true');

                console.log("Uploading photo with message...");
                const uploadUrl = `${this.baseUrl}/${this.pageId}/photos`;
                
                const uploadResponse = await axios.post(uploadUrl, formData, {
                    headers: {
                        ...formData.getHeaders(),
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
            throw error;
        }
    }
}

export const facebookPoster = new FacebookPoster(); 