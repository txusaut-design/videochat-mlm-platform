// src/routes/admin.ts
import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { pool } from '../config/database';
import { BlockchainService } from '../services/blockchainService';
import { logger } from '../utils/logger';

const router = Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Get platform statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT COUNT(*) FROM users WHERE membership_expires_at > CURRENT_TIMESTAMP) as active_members,
        (SELECT COUNT(*) FROM rooms WHERE is_active = true) as total_rooms,
        (SELECT COUNT(*) FROM membership_transactions WHERE status = 'confirmed') as total_transactions,
        (SELECT COALESCE(SUM(amount::decimal), 0) FROM membership_transactions WHERE status = 'confirmed') as total_revenue,
        (SELECT COALESCE(SUM(amount::decimal), 0) FROM mlm_commissions WHERE status = 'paid') as total_commissions_paid
    `);

    const blockchainService = new BlockchainService();
    const platformBalance = await blockchainService.getPlatformBalance();

    res.json({
      success: true,
      data: {
        ...stats.rows[0],
        platform_balance_usdc: platformBalance
      }
    });
  } catch (error) {
    logger.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const users = await pool.query(`
      SELECT u.*, 
        (SELECT COUNT(*) FROM users WHERE referrer_id = u.id) as referral_count,
        (SELECT COALESCE(SUM(amount::decimal), 0) FROM mlm_commissions WHERE beneficiary_id = u.id AND status = 'paid') as total_earnings
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const totalCount = await pool.query('SELECT COUNT(*) FROM users');

    res.json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          page,
          limit,
          total: parseInt(totalCount.rows[0].count),
          totalPages: Math.ceil(parseInt(totalCount.rows[0].count) / limit)
        }
      }
    });
  } catch (error) {
    logger.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get recent transactions
router.get('/transactions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const transactions = await pool.query(`
      SELECT mt.*, u.username, u.email
      FROM membership_transactions mt
      JOIN users u ON mt.user_id = u.id
      ORDER BY mt.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: transactions.rows
    });
  } catch (error) {
    logger.error('Admin get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
});

export default router;