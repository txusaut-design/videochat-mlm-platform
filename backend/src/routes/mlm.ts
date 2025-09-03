// src/routes/mlm.ts
import { Router } from 'express';
import { MlmController } from '../controllers/mlmController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticateToken, MlmController.getMLMStats);
router.get('/referral-link', authenticateToken, MlmController.getReferralLink);
router.get('/commissions', authenticateToken, MlmController.getCommissions);

export default router;