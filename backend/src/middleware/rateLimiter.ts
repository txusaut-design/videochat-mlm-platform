// src/middleware/rateLimiter.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../config/redis';
import { logger } from '../utils/logger';

// Fallback in-memory rate limiter if Redis is not available
const rateLimiterMemory = new Map();

const rateLimiterOptions = {
  storeClient: getRedisClient(),
  keyGenerator: (req: Request) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60, // Block for 60 seconds if limit exceeded
};

const rateLimiter = new RateLimiterRedis(rateLimiterOptions);

export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rateLimiterRes) {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later',
      retryAfter: rateLimiterRes.msBeforeNext
    });
  }
}