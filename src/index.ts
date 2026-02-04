import type { Env } from './types.js';
import { createContent, uploadContent, validateToken } from './modules/index.js';

async function runContentPipeline(env: Env): Promise<void> {
  console.log('Starting content pipeline...');

  // Step 0: Validate Facebook token first
  console.log('Validating Facebook token...');
  const tokenStatus = await validateToken(env);

  if (!tokenStatus.valid) {
    console.error('Facebook token invalid:', tokenStatus.error);
    throw new Error(`Facebook token invalid: ${tokenStatus.error}`);
  }

  console.log('Facebook token is valid');

  // Step 1: Create content
  const result = await createContent(env);
  if (!result) {
    console.log('Content creation failed');
    return;
  }

  console.log('Content created:', result.content.text.substring(0, 100) + '...');

  // Step 2: Publish content
  const uploadResult = await uploadContent(env, result.content);
  if (!uploadResult) {
    console.log('Content upload failed');
    return;
  }

  console.log(`Content published to ${uploadResult.platform}: ${uploadResult.postId}`);
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    try {
      await runContentPipeline(env);
    } catch (error) {
      console.error('Error in scheduled task:', error);
    }
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/run') {
      try {
        await runContentPipeline(env);
        return Response.json({ success: true, message: 'Content pipeline completed' });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return Response.json({ success: false, error: message }, { status: 500 });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};
