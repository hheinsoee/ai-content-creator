export {
  createContent,
  fetchAINews,
  fetchLatestNews,
  generateAIContent,
  selectBestArticle,
  generateText,
  generateImage,
} from './createContent/index.js';

export { uploadContent, postToFacebook, addComment } from './publishContent/index.js';

export type { ContentResult } from './createContent/index.js';
export type { UploadResult } from './publishContent/index.js';
