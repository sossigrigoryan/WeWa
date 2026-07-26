import OpenAI from 'openai';
import env from '../config/env.js';

const client = new OpenAI({
  baseURL: env.GITHUB_MODELS_ENDPOINT,
  apiKey: env.GITHUB_TOKEN
});

/**
 * Generic chat method for GitHub Models.
 * @param {Array<{role: string, content: string}>} messages
 * @param {object} [options]
 * @param {string} [options.model]
 * @param {number} [options.maxTokens]
 * @param {number} [options.temperature]
 * @returns {Promise<object>}
 */
export async function chat(messages, options = {}) {
  const {
    model = env.GITHUB_MODEL,
    maxTokens = 1000,
    temperature = 0.7
  } = options;

  const response = await client.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature
  });

  return response;
}

export default client;
