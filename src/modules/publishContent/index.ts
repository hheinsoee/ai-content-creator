import type { Env, GeneratedContent } from '../../types.js';
import { postToFacebook, addComment, validateToken } from './facebook.js';

export interface UploadResult {
  postId: string;
  platform: 'facebook';
}

export async function uploadContent(
  env: Env,
  content: GeneratedContent,
): Promise<UploadResult | null> {
  try {
    console.log('Uploading content to Facebook...');
    const result = await postToFacebook(env, content);

    return {
      postId: result.id,
      platform: 'facebook',
    };
  } catch (error) {
    console.error('Error uploading content:', error);
    return null;
  }
}

export { postToFacebook, addComment, validateToken };
