// src/hooks/useVideoRoom.ts
import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useRoomStore } from '@/store/roomStore';
import { useAuthStore } from '@/store/authStore';
import socketService from '@/lib/socket';
import { Room, RoomParticipant, ChatMessage } from '@/lib/types';

export function useVideoRoom(roomId?: string) {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    currentRoom,
    participants,
    isInRoom,
    setCurrentRoom,
    setParticipants,
    addParticipant,
    removeParticipant,
    setInRoom,
    reset
  } = useRoomStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [socket, setSocket] = useState(socketService.getSocket());

  // Initialize socket connection
  useEffect(() => {
    if (!socket && user) {
      try {
        const newSocket = socketService.connect();
        setSocket(newSocket);
      } catch (error) {
        console.error('Failed to connect socket:', error);
        toast.error('Failed to connect to server');
      }
    }
  }, [user, socket]);

  // Join room
  const joinRoom = useCallback(async (roomIdToJoin: string, password?: string) => {
    if (!socket) {
      toast.error('Not connected to server');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      socket.emit('join-room', { roomId: roomIdToJoin, password });

      const handleJoinSuccess = (data: { room: Room; participants: RoomParticipant[] }) => {
        setCurrentRoom(data.room);
        setParticipants(data.participants);
        setInRoom(true);
        toast.success('Joined room successfully!');
        socket.off('joined-room', handleJoinSuccess);
        socket.off('join-room-error', handleJoinError);
        resolve(true);
      };

      const handleJoinError = (data: { message: string }) => {
        toast.error(data.message);
        socket.off('joined-room', handleJoinSuccess);
        socket.off('join-room-error', handleJoinError);
        resolve(false);
      };

      socket.on('joined-room', handleJoinSuccess);
      socket.on('join-room-error', handleJoinError);
    });
  }, [socket, setCurrentRoom, setParticipants, setInRoom]);

  // Leave room
  const leaveRoom = useCallback(() => {
    if (socket && isInRoom) {
      socket.emit('leave-room');
      reset();
      setMessages([]);
      router.push('/dashboard/rooms');
    }
  }, [socket, isInRoom, reset, router]);

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (socket && message.trim()) {
      socket.emit('chat-message', { message: message.trim() });
    }
  }, [socket]);

  // Create room
  const createRoom = useCallback((roomData: {
    name: string;
    description?: string;
    topic?: string;
    isPrivate?: boolean;
    password?: string;
  }) => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }

    socket.emit('create-room', roomData);
  }, [socket]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleUserJoined = (data: { userId: string; username: string; socketId: string }) => {
      addParticipant({
        id: data.socketId,
        room_id: currentRoom?.id || '',
        userId: data.userId,
        username: data.username,
        joined_at: new Date().toISOString(),
        is_active: true
      });
      
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'System',
        message: `${data.username} joined the room`,
        timestamp: new Date().toISOString()
      }]);
    };

    const handleUserLeft = (data: { userId: string; username: string; socketId: string }) => {
      removeParticipant(data.userId);
      
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        userId: 'system',
        username: 'System',
        message: `${data.username} left the room`,
        timestamp: new Date().toISOString()
      }]);
    };

    const handleChatMessage = (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
    };

    const handleRoomCreated = (room: Room) => {
      toast.success('Room created successfully!');
      router.push(`/dashboard/rooms/${room.id}`);
    };

    const handleCreateRoomError = (data: { message: string }) => {
      toast.error(data.message);
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('chat-message', handleChatMessage);
    socket.on('room-created', handleRoomCreated);
    socket.on('create-room-error', handleCreateRoomError);

    return () => {
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('chat-message', handleChatMessage);
      socket.off('room-created', handleRoomCreated);
      socket.off('create-room-error', handleCreateRoomError);
    };
  }, [socket, currentRoom?.id, addParticipant, removeParticipant, router]);

  // Auto-join room if roomId provided
  useEffect(() => {
    if (roomId && socket && !isInRoom) {
      joinRoom(roomId);
    }
  }, [roomId, socket, isInRoom, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInRoom) {
        leaveRoom();
      }
    };
  }, []);

  return {
    socket,
    currentRoom,
    participants,
    isInRoom,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
    createRoom,
  };
}