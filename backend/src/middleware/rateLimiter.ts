// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';

// Simplified rate limiter without Redis for development
export async function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // Skip rate limiting in development
  next();
}