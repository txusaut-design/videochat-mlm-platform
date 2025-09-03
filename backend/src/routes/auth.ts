// src/routes/auth.ts
import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.me);
router.post('/refresh', authenticateToken, AuthController.refreshToken);

export default router;