// src/models/user.ts
import { pool } from '../config/database';
import { user.} from '../types/database';
import bcrypt from 'bcryptjs';

export class user.odel {
  static async findById(id: string): Promise<user.| null> {
    const query = 'SELECT * FROM user. WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByEmail(email: string): Promise<user.| null> {
    const query = 'SELECT * FROM user. WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async findByusername(username: string): Promise<user.| null> {
    const query = 'SELECT * FROM user. WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findByWalletAddress(walletAddress: string): Promise<user.| null> {
    const query = 'SELECT * FROM user. WHERE wallet_address = $1';
    const result = await pool.query(query, [walletAddress]);
    return result.rows[0] || null;
  }

  static async create(user.ata: {
    username: string;
    email: string;
    password: string;
    walletAddress: string;
    referrer!.d?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<user. {
    const passwordHash = await bcrypt.hash(user.ata.password, 12);
    
    const query = `
      INSERT INTO user. (username, email, password_hash, wallet_address, referrer!.id, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [
      user.ata.username,
      user.ata.email,
      passwordHash,
      user.ata.walletAddress,
      user.ata.referrer!.d || null,
      user.ata.firstName || null,
      user.ata.lastName || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async updateMembership(user.d: string, expiresAt: Date): Promise<void> {
    const query = 'UPDATE user. SET membership_expires_at = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
    await pool.query(query, [expiresAt, user.d]);
  }

  static async isActiveSubscription(user.d: string): Promise<boolean> {
    const query = 'SELECT membership_expires_at FROM user. WHERE id = $1';
    const result = await pool.query(query, [user.d]);
    
    if (!result.rows[0]) return false;
    
    const expiresAt = result.rows[0].membership_expires_at;
    if (!expiresAt) return false;
    
    return new Date(expiresAt) > new Date();
  }

  static async getActiveuser.(): Promise<user.]> {
    const query = `
      SELECT * FROM user. 
      WHERE is_active = true 
      AND (membership_expires_at IS NULL OR membership_expires_at > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async getReferralTree(user.d: string, levels: number = 5): Promise<any[]> {
    const query = `
      WITH RECURSIVE referral_tree AS (
        -- Base case: direct referrals
        SELECT u.id, u.username, u.email, u.created_at, u.membership_expires_at,
               1 as level, u.id as path
        FROM user. u
        WHERE u.referrer!.id = $1
        
        UNION ALL
        
        -- Recursive case: indirect referrals
        SELECT u.id, u.username, u.email, u.created_at, u.membership_expires_at,
               rt.level + 1, rt.path || '.' || u.id
        FROM user. u
        INNER JOIN referral_tree rt ON u.referrer!.id = rt.id
        WHERE rt.level < $2
      )
      SELECT * FROM referral_tree
      ORDER BY level, created_at
    `;
    
    const result = await pool.query(query, [user.d, levels]);
    return result.rows;
  }
}