// src/models/Room.ts
import { pool } from '../config/database';
import { Room, RoomParticipant } from '../types/database';
import bcrypt from 'bcryptjs';

export class RoomModel {
  static async findById(id: string): Promise<Room | null> {
    const query = 'SELECT * FROM rooms WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findActiveRooms(limit: number = 50): Promise<Room[]> {
    const query = `
      SELECT r.*, u.username as creator_username 
      FROM rooms r 
      JOIN users u ON r.creator_id = u.id 
      WHERE r.is_active = true 
      ORDER BY r.created_at DESC 
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  static async create(roomData: {
    name: string;
    description?: string;
    topic?: string;
    creatorId: string;
    isPrivate?: boolean;
    password?: string;
  }): Promise<Room> {
    let passwordHash = null;
    if (roomData.password) {
      passwordHash = await bcrypt.hash(roomData.password, 12);
    }

    const query = `
      INSERT INTO rooms (name, description, topic, creator_id, is_private, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      roomData.name,
      roomData.description || null,
      roomData.topic || null,
      roomData.creatorId,
      roomData.isPrivate || false,
      passwordHash
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async joinRoom(roomId: string, userId: string, password?: string): Promise<{ success: boolean; message: string }> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get room details
      const roomQuery = 'SELECT * FROM rooms WHERE id = $1';
      const roomResult = await client.query(roomQuery, [roomId]);
      const room = roomResult.rows[0];

      if (!room) {
        return { success: false, message: 'Room not found' };
      }

      if (!room.is_active) {
        return { success: false, message: 'Room is not active' };
      }

      // Check password for private rooms
      if (room.is_private && room.password_hash) {
        if (!password) {
          return { success: false, message: 'Password required for private room' };
        }
        
        const isValidPassword = await bcrypt.compare(password, room.password_hash);
        if (!isValidPassword) {
          return { success: false, message: 'Invalid password' };
        }
      }

      // Check if room is full
      if (room.current_participants >= room.max_participants) {
        return { success: false, message: 'Room is full' };
      }

      // Check if user is already in room
      const existingParticipant = await client.query(
        'SELECT id FROM room_participants WHERE room_id = $1 AND user_id = $2 AND is_active = true',
        [roomId, userId]
      );

      if (existingParticipant.rows.length > 0) {
        return { success: false, message: 'Already in room' };
      }

      // Add participant
      await client.query(
        'INSERT INTO room_participants (room_id, user_id) VALUES ($1, $2)',
        [roomId, userId]
      );

      // Update participant count
      await client.query(
        'UPDATE rooms SET current_participants = current_participants + 1 WHERE id = $1',
        [roomId]
      );

      await client.query('COMMIT');
      return { success: true, message: 'Joined room successfully' };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async leaveRoom(roomId: string, userId: string): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update participant record
      await client.query(
        'UPDATE room_participants SET is_active = false, left_at = CURRENT_TIMESTAMP WHERE room_id = $1 AND user_id = $2 AND is_active = true',
        [roomId, userId]
      );

      // Update participant count
      await client.query(
        'UPDATE rooms SET current_participants = current_participants - 1 WHERE id = $1 AND current_participants > 0',
        [roomId]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getRoomParticipants(roomId: string): Promise<any[]> {
    const query = `
      SELECT rp.*, u.username, u.first_name, u.last_name, u.avatar_url
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      WHERE rp.room_id = $1 AND rp.is_active = true
      ORDER BY rp.joined_at
    `;
    const result = await pool.query(query, [roomId]);
    return result.rows;
  }

  static async getUserRooms(userId: string): Promise<Room[]> {
    const query = `
      SELECT DISTINCT r.*, u.username as creator_username
      FROM rooms r
      JOIN room_participants rp ON r.id = rp.room_id
      JOIN users u ON r.creator_id = u.id
      WHERE rp.user_id = $1 AND rp.is_active = true AND r.is_active = true
      ORDER BY rp.joined_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}