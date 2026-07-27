import { registerStartHandler } from './start.handler.js';
import { registerLanguageHandler } from './language.handler.js';
import { registerMenuHandler } from './menu.handler.js';
import { registerWardrobeHandler } from './wardrobe.handler.js';
import { rateLimitMiddleware } from '../../middlewares/rate-limit.middleware.js';

/**
 * Registers all bot handlers.
 * @param {import('grammy').Bot} bot
 */
export function registerHandlers(bot) {
  bot.use(rateLimitMiddleware);

  registerStartHandler(bot);
  registerLanguageHandler(bot);
  registerMenuHandler(bot);
  registerWardrobeHandler(bot);
}
