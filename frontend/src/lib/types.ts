// src/lib/types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  hasActiveMembership: boolean;
  membershipExpiresAt?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  isActive: boolean;
  isAdmin: boolean;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  topic?: string;
  creator_id: string;
  creator_username?: string;
  max_participants: number;
  current_participants: number;
  activeParticipants?: number;
  is_active: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  joined_at: string;
  is_active: boolean;
}

export interface MembershipTransaction {
  id: string;
  user_id: string;
  transaction_hash: string;
  amount: string;
  from_address: string;
  to_address: string;
  status: 'pending' | 'confirmed' | 'failed';
  block_number?: number;
  created_at: string;
}

export interface MlmCommission {
  id: string;
  transaction_id: string;
  beneficiary_id: string;
  payer_id: string;
  payer_username: string;
  level: number;
  amount: string;
  status: 'pending' | 'paid' | 'failed';
  paid_at?: string;
  transaction_hash?: string;
  created_at: string;
  membership_transaction_hash: string;
}

export interface MlmStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissions: string;
  thisMonthCommissions: string;
  levels: {
    [key: string]: {
      count: number;
      members: Array<{
        id: string;
        username: string;
        email: string;
        created_at: string;
        membership_expires_at?: string;
        level: number;
      }>;
    };
  };
}

export interface PaymentInfo {
  address: string;
  network: string;
  currency: string;
  amount: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

// Socket event types
export interface SocketEvents {
  'join-room': (data: { roomId: string; password?: string }) => void;
  'leave-room': () => void;
  'joined-room': (data: { room: Room; participants: RoomParticipant[] }) => void;
  'user-joined': (data: { userId: string; username: string; socketId: string }) => void;
  'user-left': (data: { userId: string; username: string; socketId: string }) => void;
  'offer': (data: { to: string; offer: any }) => void;
  'answer': (data: { to: string; answer: any }) => void;
  'ice-candidate': (data: { to: string; candidate: any }) => void;
  'chat-message': (data: ChatMessage | { message: string }) => void;
  'get-rooms': () => void;
  'rooms-list': (rooms: Room[]) => void;
  'create-room': (data: {
    name: string;
    description?: string;
    topic?: string;
    isPrivate?: boolean;
    password?: string;
  }) => void;
  'room-created': (room: Room) => void;
  'new-room-available': (room: Room) => void;
  'start-screen-share': () => void;
  'stop-screen-share': () => void;
  'user-started-screen-share': (data: { userId: string; username: string; socketId: string }) => void;
  'user-stopped-screen-share': (data: { userId: string; username: string; socketId: string }) => void;
  'toggle-audio': (data: { muted: boolean }) => void;
  'toggle-video': (data: { muted: boolean }) => void;
  'user-audio-toggle': (data: { userId: string; username: string; muted: boolean }) => void;
  'user-video-toggle': (data: { userId: string; username: string; muted: boolean }) => void;
  // Error events
  'join-room-error': (data: { message: string }) => void;
  'chat-error': (data: { message: string }) => void;
  'rooms-error': (data: { message: string }) => void;
  'create-room-error': (data: { message: string }) => void;
}