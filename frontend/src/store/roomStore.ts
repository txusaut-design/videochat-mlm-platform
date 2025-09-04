// src/store/roomStore.ts
import { create } from 'zustand';
import { Room, RoomParticipant } from '@/lib/types';

interface RoomState {
  rooms: Room[];
  currentRoom: Room | null;
  participants: RoomParticipant[];
  isInRoom: boolean;
  isLoading: boolean;
  
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  setCurrentRoom: (room: Room | null) => void;
  setParticipants: (participants: RoomParticipant[]) => void;
  addParticipant: (participant: RoomParticipant) => void;
  removeParticipant: (userId: string) => void;
  setInRoom: (inRoom: boolean) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  participants: [],
  isInRoom: false,
  isLoading: false,
  
  setRooms: (rooms) => set({ rooms }),
  
  addRoom: (room) => set(state => ({ 
    rooms: [room, ...state.rooms] 
  })),
  
  updateRoom: (roomId, updates) => set(state => ({
    rooms: state.rooms.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    ),
    currentRoom: state.currentRoom?.id === roomId 
      ? { ...state.currentRoom, ...updates } 
      : state.currentRoom
  })),
  
  setCurrentRoom: (room) => set({ currentRoom: room, isInRoom: !!room }),
  
  setParticipants: (participants) => set({ participants }),
  
  addParticipant: (participant) => set(state => ({
    participants: [...state.participants, participant]
  })),
  
  removeParticipant: (userId) => set(state => ({
    participants: state.participants.filter(p => p.user_id !== userId)
  })),
  
  setInRoom: (isInRoom) => set({ isInRoom }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  reset: () => set({
    currentRoom: null,
    participants: [],
    isInRoom: false,
    isLoading: false
  })
}));