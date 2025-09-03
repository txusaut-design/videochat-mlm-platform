// src/controllers/paymentController.ts
import { Request, Response } from 'express';
import { BlockchainService } from '../services/blockchainService';
import { MembershipTransactionModel } from '../models/MembershipTransaction';
import { logger } from '../utils/logger';

export class PaymentController {
  static async getPlatformWallet(req: Request, res: Response) {
    try {
      const blockchainService = new BlockchainService();
      const platformAddress = process.env.PLATFORM_WALLET_ADDRESS;
      
      if (!platformAddress) {
        return res.status(500).json({
          success: false,
          message: 'Platform wallet not configured'
        });
      }

      res.json({
        success: true,
        data: {
          address: platformAddress,
          network: 'Polygon',
          currency: 'USDC',
          amount: process.env.MEMBERSHIP_PRICE_USDC || '10'
        }
      });

    } catch (error) {
      logger.error('Get platform wallet error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment info'
      });
    }
  }

  static async verifyPayment(req: Request, res: Response) {
    try {
      const { transactionHash } = req.body;
      const userId = req.user?.userId!;

      if (!transactionHash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash required'
        });
      }

      // Check if transaction already exists
      const existingTransaction = await MembershipTransactionModel.findByTransactionHash(transactionHash);
      if (existingTransaction) {
        return res.status(400).json({
          success: false,
          message: 'Transaction already processed'
        });
      }

      // The blockchain service will automatically process this transaction
      // when it detects the payment on-chain
      res.json({
        success: true,
        message: 'Transaction submitted for verification'
      });

    } catch (error) {
      logger.error('Verify payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify payment'
      });
    }
  }

  static async getPaymentHistory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId!;
      const limit = parseInt(req.query.limit as string) || 50;

      // Get user's payment history (this would need to be implemented in the model)
      const query = `
        SELECT * FROM membership_transactions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `;
      
      const { pool } = require('../config/database');
      const result = await pool.query(query, [userId, limit]);

      res.json({
        success: true,
        data: result.rows
      });

    } catch (error) {
      logger.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history'
      });
    }
  }
}