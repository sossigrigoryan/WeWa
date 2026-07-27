import OpenAI from 'openai';
import env from '../config/env.js';
import logger from '../common/logger.js';

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

  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    });

    return response;
  } catch (error) {
    logger.error({ err: error }, 'GitHub Models API request failed');
    throw error;
  }
}

export default client;
