// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { UserModel } from '../models/User';
import { MlmTreeModel } from '../models/MlmTree';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  referralCode: Joi.string().optional(),
  firstName: Joi.string().max(100).optional(),
  lastName: Joi.string().max(100).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      // Validate request data
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }

      const { username, email, password, walletAddress, referralCode, firstName, lastName } = value;

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const existingUsername = await UserModel.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }

      const existingWallet = await UserModel.findByWalletAddress(walletAddress);
      if (existingWallet) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address already registered'
        });
      }

      // Find referrer if referral code provided
      let referrerId: string | undefined;
      if (referralCode) {
        const referrer = await UserModel.findByUsername(referralCode);
        if (!referrer) {
          return res.status(400).json({
            success: false,
            message: 'Invalid referral code'
          });
        }
        referrerId = referrer.id;
      }

      // Create user
      const user = await UserModel.create({
        username,
        email,
        password,
        walletAddress,
        referrerId,
        firstName,
        lastName
      });

      // Create MLM tree entry
      await MlmTreeModel.createNode(user.id, referrerId);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, isAdmin: user.is_admin },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.wallet_address,
            isActive: user.is_active,
            membershipExpiresAt: user.membership_expires_at
          },
          token
        }
      });

    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      // Validate request data
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }

      const { email, password } = value;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, isAdmin: user.is_admin },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.wallet_address,
            isActive: user.is_active,
            isAdmin: user.is_admin,
            membershipExpiresAt: user.membership_expires_at,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url
          },
          token
        }
      });

    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if membership is active
      const hasActiveMembership = await UserModel.isActiveSubscription(userId);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.wallet_address,
            isActive: user.is_active,
            isAdmin: user.is_admin,
            hasActiveMembership,
            membershipExpiresAt: user.membership_expires_at,
            firstName: user.first_name,
            lastName: user.last_name,
            avatarUrl: user.avatar_url,
            bio: user.bio
          }
        }
      });

    } catch (error) {
      logger.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async refreshToken(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const user = await UserModel.findById(userId);
      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid user'
        });
      }

      // Generate new JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, isAdmin: user.is_admin },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token }
      });

    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}