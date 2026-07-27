import { Keyboard } from 'grammy';
import { addItem, getWardrobe } from '../../modules/wardrobe/wardrobe.service.js';
import { getUserLanguage } from '../../services/user-store.service.js';
import { getLocale } from '../../locales/index.js';
import { showMainMenu } from '../../services/menu.service.js';

const waitingForPhoto = new Map();

async function safeReply(ctx, message, options = {}) {
  try {
    await ctx.reply(message, options);
  } catch {
    // Ignore reply failures so the interaction stays resilient.
  }
}

async function safeReplyWithPhoto(ctx, photoSource, options = {}) {
  try {
    await ctx.replyWithPhoto(photoSource, options);
  } catch {
    // Ignore photo reply failures so the interaction stays resilient.
  }
}

function formatDisplayValue(value) {
  if (typeof value !== 'string') {
    return 'Unknown';
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return 'Unknown';
  }

  const categoryMap = {
    DRESSES: 'Dress',
    TOPS: 'Top',
    BOTTOMS: 'Bottom',
    OUTERWEAR: 'Outerwear',
    SHOES: 'Shoes',
    BAGS: 'Bag',
    ACCESSORIES: 'Accessory'
  };

  const normalizedValue = trimmedValue.toUpperCase();
  if (categoryMap[normalizedValue]) {
    return categoryMap[normalizedValue];
  }

  return trimmedValue.charAt(0).toUpperCase() + trimmedValue.slice(1);
}

export function formatItemAddedMessage(result = {}) {
  const category = formatDisplayValue(result.category);
  const primaryColor = formatDisplayValue(result.primaryColor);
  const material = formatDisplayValue(result.material);
  const style = formatDisplayValue(result.style);

  return [
    '✅ Item added!',
    '',
    `👗 Category: ${category}`,
    `🎨 Color: ${primaryColor}`,
    `🧵 Material: ${material}`,
    `🌸 Style: ${style}`
  ].join('\n');
}

function createWardrobeKeyboard(locale) {
  return new Keyboard()
    .text(locale.addItem)
    .row()
    .text(locale.myItems)
    .row()
    .text(locale.back)
    .resized();
}

async function handleWardrobeMenu(ctx) {
  const userLanguage = await getUserLanguage(ctx.from.id);
  const locale = getLocale(userLanguage || 'en');
  await safeReply(ctx, locale.wardrobeMenu, { reply_markup: createWardrobeKeyboard(locale) });
}

async function handleAddItem(ctx) {
  const userLanguage = await getUserLanguage(ctx.from.id);
  const locale = getLocale(userLanguage || 'en');
  waitingForPhoto.set(ctx.from.id, { awaitingPhoto: true });
  await safeReply(ctx, locale.sendPhotoForItem, { reply_markup: { remove_keyboard: true } });
}

export function formatWardrobeItemMessage(item = {}) {
  return [
    `👗 ${formatDisplayValue(item.category)}`,
    `🎨 ${formatDisplayValue(item.primaryColor)}`,
    `🧵 ${formatDisplayValue(item.material)}`,
    `🌸 ${formatDisplayValue(item.style)}`
  ].join('\n');
}

async function sendWardrobeItem(ctx, item) {
  const photoSource = item.telegramFileId || item.imagePath;
  await safeReplyWithPhoto(ctx, photoSource);
  await safeReply(ctx, formatWardrobeItemMessage(item), { reply_markup: { remove_keyboard: true } });
}

export function registerWardrobeHandler(bot) {
  bot.hears('Гардероб', async (ctx) => {
    try {
      await handleWardrobeMenu(ctx);
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'Wardrobe menu failed');
      await safeReply(ctx, 'Unable to open wardrobe right now.');
    }
  });

  bot.hears('Wardrobe', async (ctx) => {
    try {
      await handleWardrobeMenu(ctx);
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'Wardrobe menu failed');
      await safeReply(ctx, 'Unable to open wardrobe right now.');
    }
  });

  bot.hears('Добавить вещь', async (ctx) => {
    try {
      await handleAddItem(ctx);
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'Add item prompt failed');
      await safeReply(ctx, 'Unable to start adding an item right now.');
    }
  });

  bot.hears('Add item', async (ctx) => {
    try {
      await handleAddItem(ctx);
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'Add item prompt failed');
      await safeReply(ctx, 'Unable to start adding an item right now.');
    }
  });

  bot.hears('Мои вещи', async (ctx) => {
    try {
      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      const items = await getWardrobe(ctx);

      if (!items?.length) {
        await safeReply(ctx, 'Your wardrobe is empty.', { reply_markup: { remove_keyboard: true } });
        return;
      }

      for (const item of items) {
        await sendWardrobeItem(ctx, item);
      }
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'View wardrobe failed');
      await safeReply(ctx, 'Unable to view wardrobe right now.');
    }
  });

  bot.hears('My items', async (ctx) => {
    try {
      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      const items = await getWardrobe(ctx);

      if (!items?.length) {
        await safeReply(ctx, 'Your wardrobe is empty.', { reply_markup: { remove_keyboard: true } });
        return;
      }

      for (const item of items) {
        await sendWardrobeItem(ctx, item);
      }
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'View wardrobe failed');
      await safeReply(ctx, 'Unable to view wardrobe right now.');
    }
  });

  bot.hears('Назад', async (ctx) => {
    try {
      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      await showMainMenu(ctx, locale);
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'Back navigation failed');
      await safeReply(ctx, 'Unable to return to the menu right now.');
    }
  });

  bot.hears('Back', async (ctx) => {
    try {
      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      await showMainMenu(ctx, locale);
    } catch (error) {
      logger.error({ err: error, userId: ctx.from?.id }, 'Back navigation failed');
      await safeReply(ctx, 'Unable to return to the menu right now.');
    }
  });

  bot.on('message:photo', async (ctx) => {
    try {
      const waiting = waitingForPhoto.get(ctx.from.id);
      if (!waiting?.awaitingPhoto) {
        waitingForPhoto.set(ctx.from.id, { awaitingPhoto: true });
        return;
      }

      waitingForPhoto.delete(ctx.from.id);

      const result = await addItem(ctx, {});
      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      const successMessage = formatItemAddedMessage(result);
      await safeReply(ctx, successMessage, { reply_markup: { remove_keyboard: true } });
    } catch {
      try {
        const userLanguage = await getUserLanguage(ctx.from.id);
        const locale = getLocale(userLanguage || 'en');
        await safeReply(ctx, locale.itemAddedFailure, { reply_markup: { remove_keyboard: true } });
      } catch {
        // Ignore follow-up reply failures.
      }
    }
  });

  bot.on('message:text', async (ctx) => {
    try {
      const waiting = waitingForPhoto.get(ctx.from.id);
      if (!waiting?.awaitingPhoto) {
        return;
      }

      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      await safeReply(ctx, locale.sendPhotoForItem, { reply_markup: { remove_keyboard: true } });
    } catch {
      // Ignore text prompt failures.
    }
  });
}
