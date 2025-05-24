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
                // Convert base64 to buffer
                const imageBuffer = Buffer.from(content.imageData, 'base64');
                
                // Create form data
                const formData = new FormData();
                formData.append('source', new Blob([imageBuffer], { type: 'image/png' }));
                formData.append('access_token', this.accessToken);
                formData.append('message', content.text);
                formData.append('published', 'true');

                const uploadUrl = `${this.baseUrl}/${this.pageId}/photos`;
                
                console.log('Uploading photo to Facebook...');
                console.log('Page ID:', this.pageId);
                console.log('Upload URL:', uploadUrl);
                
                const response = await fetch(uploadUrl, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Facebook API Error Details:', errorData);
                    throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
                }

                const data = await response.json();
                console.log('Posted to Facebook successfully:', data);
                return data;
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
            console.error('Error posting to Facebook:', error);
            
            // Log detailed error information
            if (error.response?.data) {
                console.error('Facebook API Error Details:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            
            // Check for specific error types
            if (error.message.includes('access_token')) {
                throw new Error('Invalid or expired Facebook access token');
            } else if (error.message.includes('permission')) {
                throw new Error('Insufficient permissions to post to Facebook page');
            } else if (error.message.includes('rate limit')) {
                throw new Error('Facebook API rate limit exceeded');
            }
            
            throw error;
        }
    }
}

export const facebookPoster = new FacebookPoster(); 