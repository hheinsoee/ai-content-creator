import axios from 'axios';
import { config } from './config.js';

class FacebookCommenter {
    constructor() {
        this.baseUrl = 'https://graph.facebook.com/v18.0';
        this.accessToken = config.fbAccessToken;
    }

    async addComment(postId, message) {
        try {
            const url = `${this.baseUrl}/${postId}/comments`;
            const response = await axios.post(url, {
                message,
                access_token: this.accessToken
            });

            console.log('Comment added successfully:', response.data);
            return response.data;
        } catch (error) {
            if (error.response?.data?.error) {
                const fbError = error.response.data.error;
                if (fbError.code === 200) {
                    console.error('Permission Error: The access token does not have permission to post comments.');
                    console.error('Required permissions: pages_manage_posts');
                    console.error('Please make sure you are using a Page Access Token with the required permissions.');
                    console.error('You can get this from:');
                    console.error('1. Go to Facebook Developers > Your App > Tools > Graph API Explorer');
                    console.error('2. Select your app and click "Generate Access Token"');
                    console.error('3. Select the permission: pages_manage_posts');
                }
                console.error('Facebook API Error:', {
                    code: fbError.code,
                    message: fbError.message,
                    type: fbError.type
                });
            }
            console.error('Error adding comment:', error.response?.data || error.message);
            throw error;
        }
    }
}

export const facebookCommenter = new FacebookCommenter(); 