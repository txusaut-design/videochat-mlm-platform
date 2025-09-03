// src/routes/payments.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/wallet-info', PaymentController.getPlatformWallet);
router.post('/verify', authenticateToken, PaymentController.verifyPayment);
router.get('/history', authenticateToken, PaymentController.getPaymentHistory);

export default router;