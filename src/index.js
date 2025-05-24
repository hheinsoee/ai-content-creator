/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Scheduled Worker: a Worker that can run on a
 * configurable interval:
 * https://developers.cloudflare.com/workers/platform/triggers/cron-triggers/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"` to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { newsFetcher } from './news-fetcher.js';
import { aiGenerator } from './ai-generator.js';
import { facebookPoster } from './facebook-poster.js';

export async function main() {
	console.log('Starting content creation process...');
	
	try {
		// Fetch latest news
		const newsItem = await newsFetcher.fetchLatestNews();
		if (!newsItem) {
			console.log('No news items found');
			return;
		}

		console.log({origynal_content:newsItem});
		// Generate content
		console.log('Generating content...');
		const content = await aiGenerator.generateContent(newsItem);
		if (!content) {
			console.log('Failed to generate content');
			return;
		}
		console.log({generated_content:content.text});
		// Post to Facebook
		await facebookPoster.post(content);
	} catch (error) {
		console.error('Error in main process:', error);
	}
}

// Cloudflare Workers entry point
export default {
	async scheduled(event, env, ctx) {
		await main();
	},

	// Add a test endpoint
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		
		// Test endpoint
		if (url.pathname === '/test') {
			try {
				// Test content with a predefined image (1x1 transparent PNG)
				const testContent = {
					text: "မင်္ဂလာပါ။ ဒါဟာ Facebook Posting Test ဖြစ်ပါတယ်။\n\nHello! This is a Facebook Posting Test.",
					imageData: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
				};

				const result = await facebookPoster.post(testContent);
				return new Response(JSON.stringify({ success: true, result }), {
					headers: { 'Content-Type': 'application/json' }
				});
			} catch (error) {
				return new Response(JSON.stringify({ 
					success: false, 
					error: error.message,
					details: error.response?.data
				}), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		return new Response('Not found', { status: 404 });
	}
};
