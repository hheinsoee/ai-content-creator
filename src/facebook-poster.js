const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const config = require('../config');

class FacebookPoster {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.accessToken = config.fbAccessToken;
        this.pageId = config.fbPageId;
    }

    async post(content) {
        try {
            if (content.imagePath) {
                // First upload the image
                const formData = new FormData();
                const imageStream = fs.createReadStream(content.imagePath);
                
                formData.append('source', imageStream);
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

module.exports = new FacebookPoster(); 