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
                formData.append('source', fs.createReadStream(content.imagePath));
                formData.append('access_token', this.accessToken);
                console.log("uploading photo...")
                const uploadUrl = `${this.baseUrl}/${this.pageId}/photos`;
                const uploadResponse = await axios.post(uploadUrl, formData, {
                    headers: {
                        ...formData.getHeaders()
                    }
                });
                console.log({ uploadResponse })
                // Then create a post with the image
                const postUrl = `${this.baseUrl}/${this.pageId}/feed`;
                const postResponse = await axios.post(postUrl, {
                    message: content.text,
                    attached_media: [{ media_fbid: uploadResponse.data.id }],
                    access_token: this.accessToken
                });

                console.log('Posted to Facebook successfully:', postResponse.data.id);
                return postResponse.data;
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