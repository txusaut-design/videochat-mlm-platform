// src/models/User.ts
import { pool } from '../config/database';
import { User } from '../types/database';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async findById(id: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const query = 'SELECT * FROM users WHERE wallet_address = $1';
    const result = await pool.query(query, [walletAddress]);
    return result.rows[0] || null;
  }

  static async create(userData: {
    username: string;
    email: string;
    password: string;
    walletAddress: string;
    referrerId?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    const query = `
      INSERT INTO users (username, email, password_hash, wallet_address, referrer_id, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      userData.username,
      userData.email,
      passwordHash,
      userData.walletAddress,
      userData.referrerId || null,
      userData.firstName || null,
      userData.lastName || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateMembership(userId: string, expiresAt: Date): Promise<void> {
    const query = 'UPDATE users SET membership_expires_at = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await pool.query(query, [expiresAt, userId]);
  }

  static async isActiveSubscription(userId: string): Promise<boolean> {
    const query = 'SELECT membership_expires_at FROM users WHERE id = $1';
    const result = await pool.query(query, [userId]);
    
    if (!result.rows[0]) return false;
    
    const expiresAt = result.rows[0].membership_expires_at;
    if (!expiresAt) return false;
    
    return new Date(expiresAt) > new Date();
  }

  static async getActiveUsers(): Promise<User[]> {
    const query = `
      SELECT * FROM users 
      WHERE is_active = true 
      AND (membership_expires_at IS NULL OR membership_expires_at > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getReferralTree(userId: string, levels: number = 5): Promise<any[]> {
    const query = `
      WITH RECURSIVE referral_tree AS (
        -- Base case: direct referrals
        SELECT u.id, u.username, u.email, u.created_at, u.membership_expires_at,
               1 as level, u.id as path
        FROM users u
        WHERE u.referrer_id = $1
        
        UNION ALL
        
        -- Recursive case: indirect referrals
        SELECT u.id, u.username, u.email, u.created_at, u.membership_expires_at,
               rt.level + 1, rt.path || '.' || u.id
        FROM users u
        INNER JOIN referral_tree rt ON u.referrer_id = rt.id
        WHERE rt.level < $2
      )
      SELECT * FROM referral_tree
      ORDER BY level, created_at
    `;
    
    const result = await pool.query(query, [userId, levels]);
    return result.rows;
  }
}