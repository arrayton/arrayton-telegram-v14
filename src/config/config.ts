import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  ADMIN_TELEGRAM_IDS: z
    .string()
    .optional()
    .transform((str) =>
      str
        ? str
            .split(',')
            .map((id) => Number(id.trim()))
            .filter((id) => !isNaN(id))
        : []
    ),
  PORT: z.union([z.number(), z.string()]).default(3009),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  BOT_USERNAME: z.string().optional(),
  BOT_TOKEN: z.string(),
  DATABASE_URL: z.string(),
});

export const config = envSchema.parse(process.env);