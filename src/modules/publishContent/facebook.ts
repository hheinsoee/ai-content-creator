import type { Env, GeneratedContent, FacebookPostResult, FacebookError, TokenDebugResponse } from '../../types.js';

const FB_API_VERSION = 'v18.0';
const FB_BASE_URL = `https://graph.facebook.com/${FB_API_VERSION}`;

// Validate Facebook token before running pipeline
export async function validateToken(env: Env): Promise<{ valid: boolean; error?: string }> {
  try {
    const url = `https://graph.facebook.com/debug_token?input_token=${env.FB_ACCESS_TOKEN}&access_token=${env.FB_ACCESS_TOKEN}`;
    const response = await fetch(url);
    const data = (await response.json()) as TokenDebugResponse;

    if (data.error) {
      return { valid: false, error: data.error.message };
    }

    if (!data.data?.is_valid) {
      return { valid: false, error: 'Token is invalid or expired' };
    }

    // Check if token expires soon (within 1 hour)
    if (data.data.expires_at) {
      const expiresIn = data.data.expires_at - Math.floor(Date.now() / 1000);
      if (expiresIn < 3600) {
        console.warn(`Token expires in ${Math.floor(expiresIn / 60)} minutes`);
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function validateConfig(env: Env): void {
  if (!env.FB_PAGE_ID || !/^\d+$/.test(env.FB_PAGE_ID)) {
    throw new Error('Invalid Facebook Page ID. It must be a numeric value.');
  }
  if (!env.FB_ACCESS_TOKEN) {
    throw new Error('Facebook Access Token is required');
  }
}

export async function postToFacebook(
  env: Env,
  content: GeneratedContent
): Promise<FacebookPostResult> {
  validateConfig(env);

  if (content.imageData) {
    return postWithImage(env, content);
  }
  return postTextOnly(env, content.text);
}

async function postWithImage(
  env: Env,
  content: GeneratedContent
): Promise<FacebookPostResult> {
  const imageBuffer = Uint8Array.from(atob(content.imageData!), (c) => c.charCodeAt(0));

  const formData = new FormData();
  formData.append('source', new Blob([imageBuffer], { type: 'image/png' }), 'image.png');
  formData.append('access_token', env.FB_ACCESS_TOKEN);
  formData.append('message', content.text);
  formData.append('published', 'true');

  const url = `${FB_BASE_URL}/${env.FB_PAGE_ID}/photos`;
  console.log('Uploading photo to Facebook...');

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = (await response.json()) as FacebookError;
    console.error('Facebook API Error:', errorData);
    throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
  }

  const data = (await response.json()) as FacebookPostResult;
  console.log('Posted to Facebook successfully:', data.id);
  return data;
}

async function postTextOnly(env: Env, text: string): Promise<FacebookPostResult> {
  const url = `${FB_BASE_URL}/${env.FB_PAGE_ID}/feed`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: text,
      access_token: env.FB_ACCESS_TOKEN,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as FacebookError;
    console.error('Facebook API Error:', errorData);
    throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
  }

  const data = (await response.json()) as FacebookPostResult;
  console.log('Posted to Facebook successfully:', data.id);
  return data;
}

export async function addComment(env: Env, postId: string, message: string): Promise<void> {
  const url = `${FB_BASE_URL}/${postId}/comments`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      access_token: env.FB_ACCESS_TOKEN,
    }),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as FacebookError;
    console.error('Facebook Comment Error:', errorData);

    if (errorData.error?.code === 200) {
      console.error('Permission Error: Missing pages_manage_posts permission');
    }
    throw new Error(`Facebook API Error: ${errorData.error?.message}`);
  }

  const data = await response.json();
  console.log('Comment added successfully:', data);
}
