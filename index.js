import env from './src/config/env.js';
import logger from './src/common/logger.js';

async function main() {
  logger.info('Configuration loaded successfully');
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info('Application ready');
}

process.on('unhandledRejection', (reason) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error({ err: error }, 'Unhandled Rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

main().catch((error) => {
  logger.error({ err: error }, 'Critical error during startup');
  process.exit(1);
});
