import prisma from '../lib/prisma.js';

/**
 * Finds user by Telegram ID.
 * @param {number | bigint} telegramId
 * @returns {Promise<object | null>}
 */
export async function findByTelegramId(telegramId) {
  return prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) }
  });
}

/**
 * Creates a new user.
 * @param {object} data
 * @param {number | bigint} data.telegramId
 * @param {string} data.language
 * @param {string} [data.username]
 * @param {string} [data.firstName]
 * @returns {Promise<object>}
 */
export async function create(data) {
  return prisma.user.create({
    data: {
      ...data,
      telegramId: BigInt(data.telegramId)
    }
  });
}

/**
 * Updates user language.
 * @param {number | bigint} telegramId
 * @param {string} language
 * @returns {Promise<object>}
 */
export async function updateLanguage(telegramId, language) {
  return prisma.user.update({
    where: { telegramId: BigInt(telegramId) },
    data: { language }
  });
}

/**
 * Gets user language by Telegram ID.
 * @param {number | bigint} telegramId
 * @returns {Promise<string | null>}
 */
export async function getLanguage(telegramId) {
  const user = await findByTelegramId(telegramId);
  return user?.language || null;
}

/**
 * Upserts user language (creates or updates).
 * @param {number | bigint} telegramId
 * @param {string} language
 * @returns {Promise<object>}
 */
export async function upsertLanguage(telegramId, language) {
  return prisma.user.upsert({
    where: { telegramId: BigInt(telegramId) },
    update: { language },
    create: {
      telegramId: BigInt(telegramId),
      language
    }
  });
}
