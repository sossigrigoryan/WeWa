import pino from 'pino';
import env from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';

const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'token',
      'botToken',
      'TELEGRAM_BOT_TOKEN',
      'apiKey',
      'AI_API_KEY',
      'authorization',
      '*.token',
      '*.botToken',
      '*.apiKey',
      '*.authorization',
      'req.headers.authorization',
    ],
    censor: '[REDACTED]',
  },
}, isDevelopment ? pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
}) : undefined);

export default logger;
