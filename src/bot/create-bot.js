import { Bot } from 'grammy';
import env from '../config/env.js';
import { registerHandlers } from './handlers/register-handlers.js';

export function createBot() {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  registerHandlers(bot);

  return bot;
}