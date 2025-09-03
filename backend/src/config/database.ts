// src/config/database.ts
import { Pool, PoolConfig } from 'pg';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'videochat_mlm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000'),
};

export const pool = new Pool(poolConfig);

export async function connectDatabase(): Promise<void> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    logger.info('Database connection successful:', result.rows[0].now);
    client.release();
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}

// src/types/database.ts
export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  wallet_address: string;
  referrer_id?: string;
  membership_expires_at?: Date;
  is_active: boolean;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface MlmTree {
  id: string;
  user_id: string;
  parent_id?: string;
  level: number;
  path: string;
  created_at: Date;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  topic?: string;
  creator_id: string;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  is_private: boolean;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: Date;
  left_at?: Date;
  is_active: boolean;
}

export interface MembershipTransaction {
  id: string;
  user_id: string;
  transaction_hash: string;
  amount: string;
  from_address: string;
  to_address: string;
  block_number?: number;
  block_hash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  membership_days: number;
  processed_at?: Date;
  created_at: Date;
}

export interface MlmCommission {
  id: string;
  transaction_id: string;
  beneficiary_id: string;
  payer_id: string;
  level: number;
  amount: string;
  status: 'pending' | 'paid' | 'failed';
  paid_at?: Date;
  transaction_hash?: string;
  created_at: Date;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_at: Date;
}