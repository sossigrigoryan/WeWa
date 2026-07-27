import logger from '../common/logger.js';
import { findByTelegramId, getLanguage, upsertLanguage } from '../repositories/user.repository.js';

/**
 * Gets user data by ID.
 * @param {number} userId
 * @returns {Promise<object | null>}
 */
export async function getUser(userId) {
  return findByTelegramId(userId);
}

/**
 * Sets user language.
 * @param {number} userId
 * @param {string} language
 * @returns {Promise<void>}
 */
export async function setUserLanguage(userId, language) {
  try {
    await upsertLanguage(userId, language);
  } catch (error) {
    logger.error({ err: error, userId }, 'Failed to persist user language');
    throw error;
  }
}

/**
 * Gets user language.
 * @param {number} userId
 * @returns {Promise<string | null>}
 */
export async function getUserLanguage(userId) {
  try {
    return await getLanguage(userId);
  } catch (error) {
    logger.error({ err: error, userId }, 'Failed to load user language');
    throw error;
  }
}
