import { Keyboard } from 'grammy';
import { addItem, getWardrobe } from '../../modules/wardrobe/wardrobe.service.js';
import { getUserLanguage } from '../../services/user-store.service.js';
import { getLocale } from '../../locales/index.js';
import { showMainMenu } from '../../services/menu.service.js';

const waitingForPhoto = new Map();

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
  await ctx.reply(locale.wardrobeMenu, { reply_markup: createWardrobeKeyboard(locale) });
}

async function handleAddItem(ctx) {
  const userLanguage = await getUserLanguage(ctx.from.id);
  const locale = getLocale(userLanguage || 'en');
  waitingForPhoto.set(ctx.from.id, { awaitingPhoto: true });
  await ctx.reply(locale.sendPhotoForItem, { reply_markup: { remove_keyboard: true } });
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
  await ctx.replyWithPhoto(photoSource);
  await ctx.reply(formatWardrobeItemMessage(item), { reply_markup: { remove_keyboard: true } });
}

export function registerWardrobeHandler(bot) {
  bot.hears('Гардероб', async (ctx) => {
    await handleWardrobeMenu(ctx);
  });

  bot.hears('Wardrobe', async (ctx) => {
    await handleWardrobeMenu(ctx);
  });

  bot.hears('Добавить вещь', async (ctx) => {
    await handleAddItem(ctx);
  });

  bot.hears('Add item', async (ctx) => {
    await handleAddItem(ctx);
  });

  bot.hears('Мои вещи', async (ctx) => {
    const userLanguage = await getUserLanguage(ctx.from.id);
    const locale = getLocale(userLanguage || 'en');
    const items = await getWardrobe(ctx);

    if (!items?.length) {
      await ctx.reply('Your wardrobe is empty.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    for (const item of items) {
      await sendWardrobeItem(ctx, item);
    }
  });

  bot.hears('My items', async (ctx) => {
    const userLanguage = await getUserLanguage(ctx.from.id);
    const locale = getLocale(userLanguage || 'en');
    const items = await getWardrobe(ctx);

    if (!items?.length) {
      await ctx.reply('Your wardrobe is empty.', { reply_markup: { remove_keyboard: true } });
      return;
    }

    for (const item of items) {
      await sendWardrobeItem(ctx, item);
    }
  });

  bot.hears('Назад', async (ctx) => {
    const userLanguage = await getUserLanguage(ctx.from.id);
    const locale = getLocale(userLanguage || 'en');
    await showMainMenu(ctx, locale);
  });

  bot.hears('Back', async (ctx) => {
    const userLanguage = await getUserLanguage(ctx.from.id);
    const locale = getLocale(userLanguage || 'en');
    await showMainMenu(ctx, locale);
  });

  bot.on('message:photo', async (ctx) => {
    const waiting = waitingForPhoto.get(ctx.from.id);
    if (!waiting?.awaitingPhoto) {
      waitingForPhoto.set(ctx.from.id, { awaitingPhoto: true });
      return;
    }

    waitingForPhoto.delete(ctx.from.id);

    try {
      const result = await addItem(ctx, {});
      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      const successMessage = formatItemAddedMessage(result);
      await ctx.reply(successMessage, { reply_markup: { remove_keyboard: true } });
    } catch (error) {
      const userLanguage = await getUserLanguage(ctx.from.id);
      const locale = getLocale(userLanguage || 'en');
      await ctx.reply(locale.itemAddedFailure, { reply_markup: { remove_keyboard: true } });
    }
  });

  bot.on('message:text', async (ctx) => {
    const waiting = waitingForPhoto.get(ctx.from.id);
    if (!waiting?.awaitingPhoto) {
      return;
    }

    const userLanguage = await getUserLanguage(ctx.from.id);
    const locale = getLocale(userLanguage || 'en');
    await ctx.reply(locale.sendPhotoForItem, { reply_markup: { remove_keyboard: true } });
  });
}
