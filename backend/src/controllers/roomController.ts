// src/controllers/roomController.ts
import { Request, Response } from 'express';
import Joi from 'joi';
import { RoomModel } from '../models/Room';
import { logger } from '../utils/logger';
import { activeRooms } from '../sockets/socketHandlers';

const createRoomSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  topic: Joi.string().max(200).optional(),
  isPrivate: Joi.boolean().optional(),
  password: Joi.string().min(4).max(50).optional()
});

export class RoomController {
  static async getRooms(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const rooms = await RoomModel.findActiveRooms(limit);
      
      // Add real-time participant count
      const roomsWithParticipants = rooms.map(room => ({
        ...room,
        activeParticipants: activeRooms.get(room.id)?.participants.size || 0
      }));

      res.json({
        success: true,
        data: roomsWithParticipants
      });

    } catch (error) {
      logger.error('Get rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch rooms'
      });
    }
  }

  static async getRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const room = await RoomModel.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found'
        });
      }

      const participants = await RoomModel.getRoomParticipants(roomId);
      const activeParticipants = activeRooms.get(roomId)?.participants.size || 0;

      res.json({
        success: true,
        data: {
          ...room,
          participants,
          activeParticipants
        }
      });

    } catch (error) {
      logger.error('Get room error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch room'
      });
    }
  }

  static async createRoom(req: Request, res: Response) {
    try {
      const { error, value } = createRoomSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          details: error.details[0].message
        });
      }

      const userId = req.user?.userId!;
      const room = await RoomModel.create({
        ...value,
        creatorId: userId
      });

      logger.info(`Room created: ${room.name} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: room
      });

    } catch (error) {
      logger.error('Create room error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create room'
      });
    }
  }

  static async getUserRooms(req: Request, res: Response) {
    try {
      const userId = req.user?.userId!;
      const rooms = await RoomModel.getUserRooms(userId);

      // Add real-time participant count
      const roomsWithParticipants = rooms.map(room => ({
        ...room,
        activeParticipants: activeRooms.get(room.id)?.participants.size || 0
      }));

      res.json({
        success: true,
        data: roomsWithParticipants
      });

    } catch (error) {
      logger.error('Get user rooms error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user rooms'
      });
    }
  }

  static async joinRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { password } = req.body;
      const userId = req.user?.userId!;

      const result = await RoomModel.joinRoom(roomId, userId, password);

      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }

    } catch (error) {
      logger.error('Join room error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to join room'
      });
    }
  }

  static async leaveRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const userId = req.user?.userId!;

      await RoomModel.leaveRoom(roomId, userId);

      res.json({
        success: true,
        message: 'Left room successfully'
      });

    } catch (error) {
      logger.error('Leave room error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to leave room'
      });
    }
  }
}