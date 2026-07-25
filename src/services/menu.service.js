import { createMainMenuKeyboard } from '../bot/keyboards/main-menu.keyboard.js';

/**
 * Shows main menu.
 * @param {import('grammy').Context} ctx
 * @param {object} locale
 */
export async function showMainMenu(ctx, locale) {
  await ctx.reply(
    locale.welcome,
    { reply_markup: createMainMenuKeyboard(locale) }
  );
}
