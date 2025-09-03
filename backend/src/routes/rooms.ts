// src/routes/rooms.ts
import { Router } from 'express';
import { RoomController } from '../controllers/roomController';
import { authenticateToken, requireActiveMembership } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, RoomController.getRooms);
router.get('/my-rooms', authenticateToken, RoomController.getUserRooms);
router.get('/:roomId', authenticateToken, RoomController.getRoom);
router.post('/', authenticateToken, requireActiveMembership, RoomController.createRoom);
router.post('/:roomId/join', authenticateToken, requireActiveMembership, RoomController.joinRoom);
router.post('/:roomId/leave', authenticateToken, RoomController.leaveRoom);

export default router;