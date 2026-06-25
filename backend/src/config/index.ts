import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  OPENWEATHER_API_KEY: z.string().optional(),
  RISK_ENGINE_URL: z.string().default('http://localhost:8000'),
});

export const config = envSchema.parse(process.env);
