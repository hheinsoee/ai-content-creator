
import fs from 'fs';
import path from 'path';
import { generateImage } from './src/modules/createContent/ai.js';
import type { Env } from './src/types.js';

// Helper to load .dev.vars
function loadEnv(): Env {
    const envPath = path.join(process.cwd(), '.dev.vars');
    const env: any = {};

    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                env[key] = value;
            }
        });
    } else {
        console.warn("Warning: .dev.vars not found. Ensure environment variables are set.");
    }

    return env as Env;
}

async function main() {
    const args = process.argv.slice(2);
    const prompt = args[0];

    if (!prompt) {
        console.error('Please provide a prompt: npx tsx image.ts "Your prompt here"');
        process.exit(1);
    }

    console.log(`🎨 Generatng image for: "${prompt}"...`);

    const env = loadEnv();

    // Ensure we have a model selected
    if (!env.AI_IMAGE_MODEL || env.AI_IMAGE_MODEL === 'none') {
        console.warn("⚠️ AI_IMAGE_MODEL is not set or set to 'none' in .dev.vars.");
        console.warn("Defaulting to 'dall-e-3' for this test...");
        env.AI_IMAGE_MODEL = 'dall-e-3';
    }

    // Mock DB/Bucket if needed (though generateImage mostly needs Bucket for upload, which we might want to skip or mock for a local test, but the code tries to upload to R2 if BUCKET exists. For this local test, we want to save to disk, so we can mock BUCKET to do nothing or fail gracefully, but the IMPORTANT part is getting the base64 back).
    // The generateImage function returns the base64 string directly.
    // It attempts to upload to R2 if env.BUCKET is present. We can leave it undefined to skip R2 upload.

    // Overwrite BUCKET to undefined to avoid R2 errors locally
    // @ts-ignore
    env.BUCKET = undefined;

    const imageData = await generateImage(env, prompt);

    if (imageData) {
        const imageDir = path.join(process.cwd(), 'image');
        if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir);
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `generated-${timestamp}.png`;
        const filepath = path.join(imageDir, filename);

        // Convert base64 to buffer
        const buffer = Buffer.from(imageData, 'base64');
        fs.writeFileSync(filepath, buffer);

        console.log(`✅ Image saved to: ${filepath}`);
    } else {
        console.error('❌ Failed to generate image.');
    }
}

main().catch(console.error);
