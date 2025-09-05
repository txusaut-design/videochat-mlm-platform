// src/sockets/socketHandlers.ts
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { user.odel } from '../models/user.;
import { RoomModel } from '../models/Room';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  user.d?: string;
  username?: string;
  currentRoomId?: string;
}

interface RoomData {
  participants: Map<string, { user.d: string; username: string; socketId: string }>;
  createdAt: Date;
}

// In-memory store for active rooms and participants
const activeRooms = new Map<string, RoomData>();

export function setupSocketHandlers(io: SocketIOServer) {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user.= await user.odel.findById(payload.user.d);

      if (!user.|| !user.is_active) {
        return next(new Error('Invalid or inactive user.));
      }

      // Check if user.has active membership
      const hasActiveMembership = await user.odel.isActiveSubscription(user.id);
      if (!hasActiveMembership) {
        return next(new Error('Active membership required'));
      }

      socket.user.d = user.id;
      socket.username = user.username;
      
      logger.info(`user.authenticated: ${user.username} (${socket.id})`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`user.connected: ${socket.username} (${socket.id})`);

    // Join user.to their personal room for notifications
    socket.join(`user.${socket.user.d}`);

    // Handle joining a video chat room
    socket.on('join-room', async (data: { roomId: string; password?: string }) => {
      try {
        const { roomId, password } = data;

        // Validate room access
        const joinResult = await RoomModel.joinRoom(roomId, socket.user.d!, password);
        
        if (!joinResult.success) {
          socket.emit('join-room-error', { message: joinResult.message });
          return;
        }

        // Leave current room if in one
        if (socket.currentRoomId) {
          await handleLeaveRoom(socket, socket.currentRoomId);
        }

        // Join the new room
        socket.join(roomId);
        socket.currentRoomId = roomId;

        // Add to active rooms tracking
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, {
            participants: new Map(),
            createdAt: new Date()
          });
        }

        const roomData = activeRooms.get(roomId)!;
        roomData.participants.set(socket.user.d!, {
          user.d: socket.user.d!,
          username: socket.username!,
          socketId: socket.id
        });

        // Get room details and participants
        const room = await RoomModel.findById(roomId);
        const participants = await RoomModel.getRoomParticipants(roomId);

        // Notify user.of successful join
        socket.emit('joined-room', {
          room,
          participants: Array.from(roomData.participants.values())
        });

        // Notify other participants
        socket.to(roomId).emit('user.joined', {
          user.d: socket.user.d,
          username: socket.username,
          socketId: socket.id
        });

        logger.info(`${socket.username} joined room ${roomId}`);

      } catch (error) {
        logger.error('Join room error:', error);
        socket.emit('join-room-error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave-room', async () => {
      if (socket.currentRoomId) {
        await handleLeaveRoom(socket, socket.currentRoomId);
      }
    });

    // WebRTC signaling handlers
    socket.on('offer', (data: { to: string; offer: any }) => {
      socket.to(data.to).emit('offer', {
        from: socket.id,
        fromuser.d: socket.user.d,
        offer: data.offer
      });
      logger.debug(`WebRTC offer sent from ${socket.username} to ${data.to}`);
    });

    socket.on('answer', (data: { to: string; answer: any }) => {
      socket.to(data.to).emit('answer', {
        from: socket.id,
        fromuser.d: socket.user.d,
        answer: data.answer
      });
      logger.debug(`WebRTC answer sent from ${socket.username} to ${data.to}`);
    });

    socket.on('ice-candidate', (data: { to: string; candidate: any }) => {
      socket.to(data.to).emit('ice-candidate', {
        from: socket.id,
        fromuser.d: socket.user.d,
        candidate: data.candidate
      });
      logger.debug(`ICE candidate sent from ${socket.username} to ${data.to}`);
    });

    // Chat message handling
    socket.on('chat-message', async (data: { message: string }) => {
      if (!socket.currentRoomId) {
        socket.emit('chat-error', { message: 'Not in a room' });
        return;
      }

      // Validate message
      if (!data.message || data.message.trim().length === 0) {
        socket.emit('chat-error', { message: 'Message cannot be empty' });
        return;
      }

      if (data.message.length > 500) {
        socket.emit('chat-error', { message: 'Message too long' });
        return;
      }

      // Broadcast message to room
      const messageData = {
        id: generateMessageId(),
        user.d: socket.user.d,
        username: socket.username,
        message: data.message.trim(),
        timestamp: new Date().toISOString()
      };

      io.to(socket.currentRoomId).emit('chat-message', messageData);
      
      logger.debug(`Chat message from ${socket.username} in room ${socket.currentRoomId}`);
    });

    // Handle screen sharing
    socket.on('start-screen-share', () => {
      if (!socket.currentRoomId) return;

      socket.to(socket.currentRoomId).emit('user.started-screen-share', {
        user.d: socket.user.d,
        username: socket.username,
        socketId: socket.id
      });
      
      logger.info(`${socket.username} started screen sharing in room ${socket.currentRoomId}`);
    });

    socket.on('stop-screen-share', () => {
      if (!socket.currentRoomId) return;

      socket.to(socket.currentRoomId).emit('user.stopped-screen-share', {
        user.d: socket.user.d,
        username: socket.username,
        socketId: socket.id
      });
      
      logger.info(`${socket.username} stopped screen sharing in room ${socket.currentRoomId}`);
    });

    // Handle mute/unmute events
    socket.on('toggle-audio', (data: { muted: boolean }) => {
      if (!socket.currentRoomId) return;

      socket.to(socket.currentRoomId).emit('user.audio-toggle', {
        user.d: socket.user.d,
        username: socket.username,
        muted: data.muted
      });
    });

    socket.on('toggle-video', (data: { muted: boolean }) => {
      if (!socket.currentRoomId) return;

      socket.to(socket.currentRoomId).emit('user.video-toggle', {
        user.d: socket.user.d,
        username: socket.username,
        muted: data.muted
      });
    });

    // Handle room list requests
    socket.on('get-rooms', async () => {
      try {
        const rooms = await RoomModel.findActiveRooms(50);
        const roomsWithParticipants = rooms.map(room => ({
          ...room,
          activeParticipants: activeRooms.get(room.id)?.participants.size || 0
        }));
        
        socket.emit('rooms-list', roomsWithParticipants);
      } catch (error) {
        logger.error('Error fetching rooms:', error);
        socket.emit('rooms-error', { message: 'Failed to fetch rooms' });
      }
    });

    // Handle creating new room
    socket.on('create-room', async (data: {
      name: string;
      description?: string;
      topic?: string;
      isPrivate?: boolean;
      password?: string;
    }) => {
      try {
        // Validate input
        if (!data.name || data.name.trim().length === 0) {
          socket.emit('create-room-error', { message: 'Room name is required' });
          return;
        }

        if (data.name.length > 100) {
          socket.emit('create-room-error', { message: 'Room name too long' });
          return;
        }

        const room = await RoomModel.create({
          name: data.name.trim(),
          description: data.description?.trim(),
          topic: data.topic?.trim(),
          creatorId: socket.user.d!,
          isPrivate: data.isPrivate || false,
          password: data.password
        });

        socket.emit('room-created', room);
        
        // Broadcast new room to all user. (except private rooms)
        if (!room.is_private) {
          socket.broadcast.emit('new-room-available', {
            ...room,
            creator_username: socket.username,
            activeParticipants: 0
          });
        }

        logger.info(`${socket.username} created room: ${room.name}`);

      } catch (error) {
        logger.error('Create room error:', error);
        socket.emit('create-room-error', { message: 'Failed to create room' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      logger.info(`user.disconnected: ${socket.username} (${socket.id}) - Reason: ${reason}`);
      
      if (socket.currentRoomId) {
        await handleLeaveRoom(socket, socket.currentRoomId);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.username}:`, error);
    });
  });

  // Cleanup inactive rooms every 5 minutes
  setInterval(() => {
    cleanupInactiveRooms();
  }, 5 * 60 * 1000);
}

// Helper function to handle leaving a room
async function handleLeaveRoom(socket: AuthenticatedSocket, roomId: string) {
  try {
    // Update database
    await RoomModel.leaveRoom(roomId, socket.user.d!);

    // Remove from active rooms tracking
    const roomData = activeRooms.get(roomId);
    if (roomData) {
      roomData.participants.delete(socket.user.d!);
      
      // If room is empty, remove it
      if (roomData.participants.size === 0) {
        activeRooms.delete(roomId);
      }
    }

    // Leave socket room
    socket.leave(roomId);

    // Notify other participants
    socket.to(roomId).emit('user.left', {
      user.d: socket.user.d,
      username: socket.username,
      socketId: socket.id
    });

    // Clear current room
    if (socket.currentRoomId === roomId) {
      socket.currentRoomId = undefined;
    }

    logger.info(`${socket.username} left room ${roomId}`);

  } catch (error) {
    logger.error('Leave room error:', error);
  }
}

// Helper function to cleanup inactive rooms
function cleanupInactiveRooms() {
  const now = new Date();
  const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

  for (const [roomId, roomData] of activeRooms.entries()) {
    if (roomData.participants.size === 0) {
      const inactiveTime = now.getTime() - roomData.createdAt.getTime();
      if (inactiveTime > maxInactiveTime) {
        activeRooms.delete(roomId);
        logger.info(`Cleaned up inactive room: ${roomId}`);
      }
    }
  }
}

// Helper function to generate message IDs
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Export active rooms for monitoring
export { activeRooms };