import logger from '../../common/logger.js';
import { Keyboard, InputFile } from 'grammy';
import fs from 'fs';
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

function formatDisplayValue(value, locale) {
  if (typeof value !== 'string') {
    return locale.unknown;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue || trimmedValue.toLowerCase() === 'unknown') {
    return locale.unknown;
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

export function formatItemAddedMessage(result = {}, locale = getLocale('en')) {
  const category = formatDisplayValue(result.category, locale);
  const primaryColor = formatDisplayValue(result.primaryColor, locale);
  const material = formatDisplayValue(result.material, locale);
  const style = formatDisplayValue(result.style, locale);

  return [
    `✅ ${locale.itemAddedSuccess}`,
    '',
    `👗 ${locale.category}: ${category}`,
    `🎨 ${locale.color}: ${primaryColor}`,
    `🧵 ${locale.material}: ${material}`,
    `🌸 ${locale.style}: ${style}`
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

async function getUserLocale(ctx) {
  const userLanguage = await getUserLanguage(ctx.from.id);
  return getLocale(userLanguage || 'en');
}

async function handleWardrobeMenu(ctx) {
  const locale = await getUserLocale(ctx);

  await safeReply(ctx, locale.wardrobeMenu, {
    reply_markup: createWardrobeKeyboard(locale)
  });
}

async function handleAddItem(ctx) {
  const locale = await getUserLocale(ctx);

  waitingForPhoto.set(ctx.from.id, { awaitingPhoto: true });

  await safeReply(ctx, locale.sendPhotoForItem, {
    reply_markup: { remove_keyboard: true }
  });
}

export function formatWardrobeItemMessage(
  item = {},
  locale = getLocale('en')
) {
  return [
    `👗 ${locale.category}: ${formatDisplayValue(item.category, locale)}`,
    `🎨 ${locale.color}: ${formatDisplayValue(item.primaryColor, locale)}`,
    `🧵 ${locale.material}: ${formatDisplayValue(item.material, locale)}`,
    `🌸 ${locale.style}: ${formatDisplayValue(item.style, locale)}`
  ].join('\n');
}

function localFileExists(filePath) {
  try {
    return Boolean(filePath) && fs.existsSync(filePath);
  } catch {
    return false;
  }
}

export async function sendWardrobeItem(ctx, item, locale = getLocale('en')) {
  const caption = formatWardrobeItemMessage(item, locale);

  // 1) Try the cached Telegram file_id first.
  if (item.telegramFileId) {
    try {
      await ctx.replyWithPhoto(item.telegramFileId, { caption });
      return;
    } catch (error) {
      logger.warn(
        { err: error, itemId: item.id },
        'telegramFileId invalid for this bot, falling back to local image'
      );
    }
  }

  // 2) Fall back to the locally saved image.
  if (localFileExists(item.imagePath)) {
    try {
      await ctx.replyWithPhoto(new InputFile(item.imagePath), { caption });
      return;
    } catch (error) {
      logger.warn(
        { err: error, itemId: item.id },
        'Failed to send local image file'
      );
    }
  }

  // 3) Last resort: text only.
  await safeReply(ctx, caption);
}

async function handleViewWardrobe(ctx) {
  try {
    const locale = await getUserLocale(ctx);
    const items = await getWardrobe(ctx);

    if (!items?.length) {
      await safeReply(ctx, locale.wardrobeEmpty);
      await handleWardrobeMenu(ctx);
      return;
    }

    for (const item of items) {
      await sendWardrobeItem(ctx, item, locale);
    }

    await handleWardrobeMenu(ctx);
  } catch (error) {
    logger.error(
      { err: error, userId: ctx.from?.id },
      'View wardrobe failed'
    );

    const locale = await getUserLocale(ctx);
    await safeReply(ctx, locale.wardrobeViewFailure);
  }
}

async function handleBack(ctx) {
  try {
    const locale = await getUserLocale(ctx);
    await showMainMenu(ctx, locale);
  } catch (error) {
    logger.error(
      { err: error, userId: ctx.from?.id },
      'Back navigation failed'
    );

    const locale = await getUserLocale(ctx);
    await safeReply(ctx, locale.backFailure);
  }
}

export function registerWardrobeHandler(bot) {
  const wardrobeButtons = [
    '👗 Гардероб',
    'Гардероб',
    '👗 Wardrobe',
    'Wardrobe',
    '👗 Զգեստապահարան',
    'Զգեստապահարան'
  ];

  bot.hears(wardrobeButtons, async (ctx) => {
    try {
      await handleWardrobeMenu(ctx);
    } catch (error) {
      logger.error(
        { err: error, userId: ctx.from?.id },
        'Wardrobe menu failed'
      );

      const locale = await getUserLocale(ctx);
      await safeReply(ctx, locale.wardrobeOpenFailure);
    }
  });

  const addItemButtons = [
    'Добавить вещь',
    'Add item',
    'Ավելացնել հագուստ'
  ];

  bot.hears(addItemButtons, async (ctx) => {
    try {
      await handleAddItem(ctx);
    } catch (error) {
      logger.error(
        { err: error, userId: ctx.from?.id },
        'Add item prompt failed'
      );

      const locale = await getUserLocale(ctx);
      await safeReply(ctx, locale.addItemStartFailure);
    }
  });

  const myItemsButtons = [
    'Мои вещи',
    'My items',
    'Իմ հագուստը'
  ];

  bot.hears(myItemsButtons, handleViewWardrobe);

  const backButtons = [
    'Назад',
    'Back',
    'Հետ'
  ];

  bot.hears(backButtons, handleBack);

  bot.on('message:photo', async (ctx) => {
    try {
      const waiting = waitingForPhoto.get(ctx.from.id);

      if (!waiting?.awaitingPhoto) {
        waitingForPhoto.set(ctx.from.id, { awaitingPhoto: true });
        return;
      }

      waitingForPhoto.delete(ctx.from.id);

      const result = await addItem(ctx, {});
      const locale = await getUserLocale(ctx);

      const successMessage = formatItemAddedMessage(result, locale);

      await safeReply(ctx, successMessage);
      await handleWardrobeMenu(ctx);
    } catch {
      try {
        const locale = await getUserLocale(ctx);

        await safeReply(ctx, locale.itemAddedFailure);
        await handleWardrobeMenu(ctx);
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

      const locale = await getUserLocale(ctx);

      await safeReply(ctx, locale.sendPhotoForItem, {
        reply_markup: { remove_keyboard: true }
      });
    } catch {
      // Ignore text prompt failures.
    }
  });
}