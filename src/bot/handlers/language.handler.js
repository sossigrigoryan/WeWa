import { handleLanguageSelection } from '../../services/language.service.js';

const languageMap = {
  '🇷🇺 Русский': 'ru',
  '🇬🇧 English': 'en',
  '🇦🇲 Հայերեն': 'hy'
};

/**
 * Registers language selection handlers.
 * @param {import('grammy').Bot} bot
 */
export function registerLanguageHandler(bot) {
  for (const [button, languageCode] of Object.entries(languageMap)) {
    bot.hears(button, async (ctx) => {
      await handleLanguageSelection(ctx, languageCode);
    });
  }
}