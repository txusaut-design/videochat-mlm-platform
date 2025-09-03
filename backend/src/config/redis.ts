# src/config/redis.ts
import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;

export async function initializeRedis(): Promise<void> {
  try {
    if (!process.env.REDIS_URL) {
      logger.warn('Redis URL not provided, skipping Redis initialization');
      return;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    // Don't throw error, app should work without Redis
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient;
}