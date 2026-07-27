import { createLanguageKeyboard } from '../keyboards/language.keyboard.js';
import { getUserLanguage } from '../../services/user-store.service.js';
import { getLocale } from '../../locales/index.js';
import { showMainMenu } from '../../services/menu.service.js';

/**
 * Registers the /start command.
 * @param {import('grammy').Bot} bot
 */
export function registerStartHandler(bot) {
  bot.command('start', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const userLanguage = await getUserLanguage(userId);

      if (userLanguage) {
        const locale = getLocale(userLanguage);
        await showMainMenu(ctx, locale);
      } else {
        const locale = getLocale('en');
        await ctx.reply(
          `${locale.welcome}\n${locale.chooseLanguage}`,
          { reply_markup: createLanguageKeyboard() }
        );
      }
    } catch (error) {
      await ctx.reply('Unable to process your request right now.');
    }
  });
}
