// src/controllers/mlmController.ts
import { Request, Response } from 'express';
import { MlmService } from '../services/mlmService';
import { MlmCommissionModel } from '../models/MlmCommission';
import { UserModel } from '../models/User';
import { logger } from '../utils/logger';

export class MlmController {
  static async getMLMStats(req: Request, res: Response) {
    try {
      const userId = req.user?.userId!;
      const stats = await MlmService.getUserMLMStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Get MLM stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch MLM statistics'
      });
    }
  }

  static async getReferralLink(req: Request, res: Response) {
    try {
      const user = await UserModel.findById(req.user?.userId!);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const frontendUrl = process.env.FRONTEND_URL || 'https://yourdomain.com';
      const referralLink = `${frontendUrl}/register?ref=${user.username}`;

      res.json({
        success: true,
        data: {
          referralCode: user.username,
          referralLink
        }
      });

    } catch (error) {
      logger.error('Get referral link error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get referral link'
      });
    }
  }

  static async getCommissions(req: Request, res: Response) {
    try {
      const userId = req.user?.userId!;
      const limit = parseInt(req.query.limit as string) || 50;

      const commissions = await MlmCommissionModel.getUserCommissions(userId, limit);

      res.json({
        success: true,
        data: commissions
      });

    } catch (error) {
      logger.error('Get commissions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch commissions'
      });
    }
  }
}
