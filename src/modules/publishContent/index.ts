import type { Env, GeneratedContent, FacebookPostResult } from '../../types.js';
import { postToFacebook, addComment } from './facebook.js';

export interface UploadResult {
  postId: string;
  platform: 'facebook';
}

export async function uploadContent(
  env: Env,
  content: GeneratedContent,
  sourceUrl?: string
): Promise<UploadResult | null> {
  try {
    console.log('Uploading content to Facebook...');
    const result = await postToFacebook(env, content);

    if (result?.id && sourceUrl) {
      console.log('Adding source comment...');
      await addComment(env, result.id, `Original article: ${sourceUrl}`);
    }

    return {
      postId: result.id,
      platform: 'facebook',
    };
  } catch (error) {
    console.error('Error uploading content:', error);
    return null;
  }
}

export { postToFacebook, addComment };
