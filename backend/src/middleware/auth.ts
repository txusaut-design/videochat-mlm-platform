// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { user.odel } from '../models/user.;

interface JWTPayload {
  user.d: string;
  email: string;
  isAdmin: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user.: JWTPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Verify user.still exists and is active
    const user.= await user.odel.findById(payload.user.d);
    if (!user.|| !user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Invalid or inactive user.
      });
    }

    req.user.= payload;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user..isAdmin) {
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

export const requireActiveMembership = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user.d = req.user..user.d;
    if (!user.d) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const hasActiveMembership = await user.odel.isActiveSubscription(user.d);
    if (!hasActiveMembership) {
      res.status(403).json({
        success: false,
        message: 'Active membership required'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking membership status'
    });
  }
};