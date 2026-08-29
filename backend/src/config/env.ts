import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default('gpt-5.6-luna'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  PORT: z.coerce.number().int().positive().default(4000)
});

export const env = schema.parse(process.env);
