import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .dev.vars as env
const devVarsPath = resolve(process.cwd(), '.dev.vars');
const devVars = readFileSync(devVarsPath, 'utf-8');
const env: Record<string, string> = {};
devVars.split('\n').forEach((line) => {
  const [key, ...value] = line.split('=');
  if (key?.trim() && value.length) {
    env[key.trim()] = value.join('=').trim();
  }
});

// Dynamic imports for ESM modules
async function loadModules() {
  const { fetchLatestNews, generateText, generateImage } = await import('../src/modules/createContent/index.js');
  const { postToFacebook, addComment } = await import('../src/modules/publishContent/index.js');
  return { fetchLatestNews, generateText, generateImage, postToFacebook, addComment };
}

async function test<T>(name: string, fn: () => Promise<T>): Promise<T | null> {
  console.log(`\n🧪 Testing: ${name}`);
  try {
    const result = await fn();
    console.log(`   ✅ Success`);
    const preview = JSON.stringify(result, null, 2);
    console.log(`   Data:`, preview.length > 500 ? preview.substring(0, 500) + '...' : preview);
    return result;
  } catch (error) {
    console.log(`   ❌ Error:`, error instanceof Error ? error.message : error);
    return null;
  }
}

async function main() {
  console.log('═'.repeat(50));
  console.log('  AI Content Creator - Test Suite');
  console.log('═'.repeat(50));

  const args = process.argv.slice(2);
  const testName = args[0];

  // Show help
  if (testName === 'help' || testName === '-h') {
    console.log(`
Usage: pnpm test:run [command]

Commands:
  (none)     Run safe tests (news, text, token)
  news       Test news fetching
  text       Test text generation
  image      Test image generation
  token      Test Facebook token validity
  post       Test Facebook post (creates real post!)
  comment    Test comment (pnpm test:run comment <postId>)
  help       Show this help
`);
    return;
  }

  const modules = await loadModules();

  // Test News
  if (testName === 'news' || !testName) {
    await test('News Fetching', () => modules.fetchLatestNews(env as any));
  }

  // Test Text Generation
  if (testName === 'text' || !testName) {
    await test('Text Generation', async () => {
      const prompt = 'Say "Hello World" in Burmese language';
      const text = await modules.generateText(env as any, prompt);
      return { prompt, text };
    });
  }

  // Test Image Generation
  if (testName === 'image') {
    await test('Image Generation', async () => {
      const description = 'A beautiful sunset over mountains with vibrant orange and purple colors';
      const imageData = await modules.generateImage(env as any, description);
      return {
        description,
        imageSize: imageData?.length ?? 0,
        preview: imageData ? imageData.substring(0, 50) + '...' : null,
      };
    });
  }

  // Test Facebook Token
  if (testName === 'token' || !testName) {
    await test('Facebook Token', async () => {
      const url = `https://graph.facebook.com/debug_token?input_token=${env.FB_ACCESS_TOKEN}&access_token=${env.FB_ACCESS_TOKEN}`;
      const res = await fetch(url);
      return res.json();
    });
  }

  // Test Post (dangerous!)
  if (testName === 'post') {
    console.log('\n⚠️  Warning: This will create a real Facebook post!');
    await test('Facebook Post', () =>
      modules.postToFacebook(env as any, {
        text: `🧪 Test Post - ${new Date().toISOString()}\n\nThis is a test post from AI Content Creator.`,
      })
    );
  }

  // Test Comment (dangerous!)
  if (testName === 'comment') {
    const postId = args[1];
    if (!postId) {
      console.log('\n❌ Usage: pnpm test:run comment <postId>');
    } else {
      await test('Facebook Comment', async () => {
        await modules.addComment(env as any, postId, `Test comment - ${new Date().toISOString()}`);
        return { postId, status: 'commented' };
      });
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('  Tests completed');
  console.log('═'.repeat(50) + '\n');
}

main().catch(console.error);
