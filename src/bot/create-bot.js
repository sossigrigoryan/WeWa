import { Bot } from 'grammy';
import env from '../config/env.js';

export function createBot() {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  bot.command('start', async (ctx) => {
    await ctx.reply('Welcome to WeWa!');
  });

  return bot;
}