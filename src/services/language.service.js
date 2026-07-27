import logger from '../common/logger.js';
import { setUserLanguage } from './user-store.service.js';
import { getLocale } from '../locales/index.js';
import { showMainMenu } from './menu.service.js';

/**
 * Handles language selection.
 * @param {import('grammy').Context} ctx
 * @param {string} languageCode
 */
export async function handleLanguageSelection(ctx, languageCode) {
  try {
    const userId = ctx.from.id;
    await setUserLanguage(userId, languageCode);
    const locale = getLocale(languageCode);
    await ctx.reply(locale.languageSelected, { reply_markup: { remove_keyboard: true } });
    await showMainMenu(ctx, locale);
  } catch (error) {
    logger.error({ err: error, userId: ctx.from?.id }, 'Language selection failed');
    throw error;
  }
}
