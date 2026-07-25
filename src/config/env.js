import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().optional().transform((val) => val && val.trim() ? val : undefined),
  ADMIN_TELEGRAM_ID: z.string().optional().transform((val) => val && val.trim() ? val : undefined).refine((val) => !val || /^\d+$/.test(val), {
    message: 'ADMIN_TELEGRAM_ID must contain only digits',
  }),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.map((err) => err.path.join('.')).join(', ');
      console.error(`Invalid configuration. Missing or invalid fields: ${missingFields}`);
      process.exit(1);
    }
    console.error('Invalid configuration');
    process.exit(1);
  }
};

const env = parseEnv();

export default Object.freeze(env);
