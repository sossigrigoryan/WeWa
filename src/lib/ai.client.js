import OpenAI from 'openai';
import env from '../config/env.js';
import logger from '../common/logger.js';

const client = new OpenAI({
  baseURL: env.AI_ENDPOINT,
  apiKey: env.AI_API_KEY
});

/**
 * Generic AI chat method.
 * The rest of the application does not depend on a specific AI provider.
 *
 * @param {Array<object>} messages
 * @param {object} [options]
 * @param {string} [options.model]
 * @param {number} [options.maxTokens]
 * @param {number} [options.temperature]
 * @returns {Promise<object>}
 */
export async function chat(messages, options = {}) {
  const {
    model = env.AI_MODEL,
    maxTokens = 1000,
    temperature = 0.7,
    responseFormat
  } = options;

  try {
    const response = await client.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        ...(responseFormat && { response_format: responseFormat })
    });

    return response;
  } catch (error) {
    logger.error({ err: error }, 'AI API request failed');
    throw error;
  }
}

export default client;