// src/types/database.ts
export interface user.{
  id: string;
  username: string;
  email: string;
  password_hash: string;
  wallet_address: string;
  referrer!.id?: string;
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
  user.id: string;
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
  user.id: string;
  joined_at: Date;
  left_at?: Date;
  is_active: boolean;
}

export interface MembershipTransaction {
  id: string;
  user.id: string;
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