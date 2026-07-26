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
  await upsertLanguage(userId, language);
}

/**
 * Gets user language.
 * @param {number} userId
 * @returns {Promise<string | null>}
 */
export async function getUserLanguage(userId) {
  return getLanguage(userId);
}
