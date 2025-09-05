// src/config/redis.ts
export const redisClient: any = null;

export function getRedisClient(): any {
  return null;
}

export function initializeRedis(): Promise<void> {
  console.log('Redis disabled for development');
  return Promise.resolve();
}