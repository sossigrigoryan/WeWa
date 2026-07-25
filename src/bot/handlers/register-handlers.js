import { registerStartHandler } from './start.handler.js';
import { registerLanguageHandler } from './language.handler.js';

/**
 * Registers all bot handlers.
 * @param {import('grammy').Bot} bot
 */
export function registerHandlers(bot) {
  registerStartHandler(bot);
  registerLanguageHandler(bot);
}
