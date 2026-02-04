export {
  createContent,
  fetchAINews,
  fetchLatestNews,
  selectAndGenerate,
  generateText,
  generateImage,
  selectBestArticle,
  generateAIContent,
} from './createContent/index.js';

export { uploadContent, postToFacebook, addComment, validateToken } from './publishContent/index.js';

export type { ContentResult } from './createContent/index.js';
export type { UploadResult } from './publishContent/index.js';
