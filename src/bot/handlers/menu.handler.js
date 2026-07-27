import { getUserLanguage } from '../../services/user-store.service.js';
import { getLocale } from '../../locales/index.js';
import { showMainMenu } from '../../services/menu.service.js';

/**
 * Registers menu button handlers.
 * @param {import('grammy').Bot} bot
 */
export function registerMenuHandler(bot) {
  bot.hears('WeWa', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const userLanguage = await getUserLanguage(userId);
      const locale = getLocale(userLanguage || 'en');
      await showMainMenu(ctx, locale);
    } catch (error) {
      await ctx.reply('Unable to process your request right now.');
    }
  });

  bot.hears('✨ Образы', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const userLanguage = await getUserLanguage(userId);
      const locale = getLocale(userLanguage || 'en');
      await ctx.reply(locale.outfits || 'Outfits feature coming soon.');
    } catch (error) {
      await ctx.reply('Unable to process your request right now.');
    }
  });

  bot.hears('✨ Outfits', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const userLanguage = await getUserLanguage(userId);
      const locale = getLocale(userLanguage || 'en');
      await ctx.reply(locale.outfits || 'Outfits feature coming soon.');
    } catch (error) {
      await ctx.reply('Unable to process your request right now.');
    }
  });

  bot.hears('⚙ Настройки', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const userLanguage = await getUserLanguage(userId);
      const locale = getLocale(userLanguage || 'en');
      await ctx.reply(locale.settings || 'Settings feature coming soon.');
    } catch (error) {
      await ctx.reply('Unable to process your request right now.');
    }
  });

  bot.hears('⚙ Settings', async (ctx) => {
    try {
      const userId = ctx.from.id;
      const userLanguage = await getUserLanguage(userId);
      const locale = getLocale(userLanguage || 'en');
      await ctx.reply(locale.settings || 'Settings feature coming soon.');
    } catch (error) {
      await ctx.reply('Unable to process your request right now.');
    }
  });
}