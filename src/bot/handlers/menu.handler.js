import { getUserLanguage } from '../../services/user-store.service.js';
import { getLocale } from '../../locales/index.js';
import { showMainMenu } from '../../services/menu.service.js';
import { createLanguageKeyboard } from '../keyboards/language.keyboard.js';

async function getUserLocale(ctx) {
  const userLanguage = await getUserLanguage(ctx.from.id);
  return getLocale(userLanguage || 'en');
}

/**
 * Registers menu button handlers.
 * @param {import('grammy').Bot} bot
 */
export function registerMenuHandler(bot) {
  bot.hears('WeWa', async (ctx) => {
    try {
      const locale = await getUserLocale(ctx);
      await showMainMenu(ctx, locale);
    } catch (error) {
      const locale = await getUserLocale(ctx);
      await ctx.reply(locale.genericError);
    }
  });

  const settingsButtons = [
    '⚙ Настройки',
    '⚙ Settings',
    '⚙ Կարգավորումներ'
  ];

  bot.hears(settingsButtons, async (ctx) => {
    try {
      const locale = await getUserLocale(ctx);

      await ctx.reply(locale.chooseYourLanguage, {
        reply_markup: createLanguageKeyboard()
      });
    } catch (error) {
      const locale = await getUserLocale(ctx);
      await ctx.reply(locale.genericError);
    }
  });
}