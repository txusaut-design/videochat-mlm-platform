// src/routes/users.ts
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { UserModel } from '../models/User';

const router = Router();

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.user?.userId!);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hasActiveMembership = await UserModel.isActiveSubscription(user.id);

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.wallet_address,
        hasActiveMembership,
        membershipExpiresAt: user.membership_expires_at,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

export default router;