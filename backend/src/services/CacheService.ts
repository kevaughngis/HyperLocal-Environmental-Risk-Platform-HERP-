import { createClient } from 'redis';
import { config } from '../config/index.js';

export const redisClient = createClient({
  url: config.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const initializeRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
};

export const cacheSet = async (key: string, value: any, ttlSeconds: number = 3600) => {
  if (!redisClient.isOpen) return;
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds
  });
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  if (!redisClient.isOpen) return null;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) as T : null;
};
