import logger from '../common/logger.js';
import { createMainMenuKeyboard } from '../bot/keyboards/main-menu.keyboard.js';

/**
 * Shows main menu.
 * @param {import('grammy').Context} ctx
 * @param {object} locale
 */
export async function showMainMenu(ctx, locale) {
  try {
    await ctx.reply(
      locale.welcome,
      { reply_markup: createMainMenuKeyboard(locale) }
    );
  } catch (error) {
    logger.error({ err: error, userId: ctx.from?.id }, 'Main menu reply failed');
    throw error;
  }
}
