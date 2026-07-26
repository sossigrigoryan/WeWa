import prisma from '../lib/prisma.js';

/**
 * Creates a draft clothing item.
 * @param {object} data
 * @param {number} data.userId
 * @param {string} data.imagePath
 * @param {string} [data.telegramFileId]
 * @returns {Promise<object>}
 */
export async function createDraft(data) {
  return prisma.wardrobeItem.create({
    data
  });
}

/**
 * Updates AI analysis results.
 * @param {number} id
 * @param {object} data
 * @param {string} [data.category]
 * @param {string} [data.type]
 * @param {string} [data.primaryColor]
 * @param {string} [data.secondaryColor]
 * @param {string} [data.material]
 * @param {string} [data.season]
 * @param {string} [data.style]
 * @param {string} [data.description]
 * @param {string} data.aiStatus
 * @param {string} [data.aiRawResponse]
 * @returns {Promise<object>}
 */
export async function updateAnalysis(id, data) {
  return prisma.wardrobeItem.update({
    where: { id },
    data
  });
}

/**
 * Finds item by ID.
 * @param {number} id
 * @returns {Promise<object | null>}
 */
export async function findById(id) {
  return prisma.wardrobeItem.findUnique({
    where: { id }
  });
}

/**
 * Finds all items for a user.
 * @param {number} userId
 * @returns {Promise<object[]>}
 */
export async function findUserItems(userId) {
  return prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Finds items by category for a user.
 * @param {number} userId
 * @param {string} category
 * @returns {Promise<object[]>}
 */
export async function findByCategory(userId, category) {
  return prisma.wardrobeItem.findMany({
    where: {
      userId,
      category
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Deletes an item by ID.
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function deleteById(id) {
  return prisma.wardrobeItem.delete({
    where: { id }
  });
}

/**
 * Checks if item belongs to user.
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export async function belongsToUser(id, userId) {
  const item = await prisma.wardrobeItem.findUnique({
    where: { id },
    select: { userId: true }
  });
  return item?.userId === userId;
}
