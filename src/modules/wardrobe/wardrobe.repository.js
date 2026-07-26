import prisma from '../../lib/prisma.js';

export async function getOrCreateUser(telegramId, profile = {}) {
  const normalizedTelegramId = BigInt(telegramId);

  let user = await prisma.user.findUnique({
    where: { telegramId: normalizedTelegramId }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        telegramId: normalizedTelegramId,
        username: profile.username ?? null,
        firstName: profile.first_name ?? profile.firstName ?? null,
        language: profile.language_code ?? 'en'
      }
    });
  }

  return user;
}

export async function createDraftItem(data) {
  return prisma.wardrobeItem.create({
    data
  });
}

export async function updateItemAnalysis(id, data) {
  return prisma.wardrobeItem.update({
    where: { id },
    data
  });
}

export async function getItemById(id) {
  return prisma.wardrobeItem.findUnique({
    where: { id }
  });
}

export async function listUserItems(userId) {
  return prisma.wardrobeItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteItemById(id) {
  return prisma.wardrobeItem.delete({
    where: { id }
  });
}

export async function checkItemOwnership(id, userId) {
  const item = await prisma.wardrobeItem.findUnique({
    where: { id },
    select: { userId: true }
  });

  return item?.userId === userId;
}
