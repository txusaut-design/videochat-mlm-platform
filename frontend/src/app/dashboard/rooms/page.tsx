// src/app/dashboard/rooms/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  VideoCameraIcon,
  PlusIcon,
  UserGroupIcon,
  ClockIcon,
  LockClosedIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

import { roomsApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CreateRoomModal from '@/components/video/CreateRoomModal';

export default function RoomsPage() {
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: rooms, isLoading, refetch } = useQuery(
    'rooms',
    roomsApi.getRooms,
    {
      enabled: !!user?.hasActiveMembership,
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  );

  const { data: userRooms } = useQuery(
    'user-rooms',
    roomsApi.getUserRooms,
    {
      enabled: !!user?.hasActiveMembership,
    }
  );

  if (!user?.hasActiveMembership) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center py-12">
          <Card className="max-w-2xl mx-auto">
            <VideoCameraIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-white">Membership Required</h3>
            <p className="mt-2 text-slate-400">
              You need an active membership to access video chat rooms.
            </p>
            <div className="mt-6">
              <Link href="/dashboard/payments">
                <Button variant="primary">
                  Purchase Membership - 10 USDC
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Video Rooms</h1>
            <p className="text-slate-400 mt-2">
              Join existing rooms or create your own video chat space
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Room</span>
          </Button>
        </div>

        {/* My Rooms */}
        {userRooms && userRooms.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">My Active Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRooms.map((room) => (
                <RoomCard key={room.id} room={room} isOwned />
              ))}
            </div>
          </div>
        )}

        {/* All Rooms */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Available Rooms</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : !rooms || rooms.length === 0 ? (
            <Card className="text-center py-12">
              <VideoCameraIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Active Rooms</h3>
              <p className="text-slate-400 mb-6">
                Be the first to create a video chat room!
              </p>
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create First Room
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          )}
        </div>

        {/* Create Room Modal */}
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      </motion.div>
    </div>
  );
}

interface RoomCardProps {
  room: any;
  isOwned?: boolean;
}

function RoomCard({ room, isOwned = false }: RoomCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card hover className="h-full">
        <div className="flex flex-col h-full">
          {/* Room Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-white truncate">{room.name}</h3>
                {room.is_private ? (
                  <LockClosedIcon className="w-4 h-4 text-amber-400" />
                ) : (
                  <GlobeAltIcon className="w-4 h-4 text-green-400" />
                )}
              </div>
              
              {room.topic && (
                <span className="inline-block bg-primary-600/20 text-primary-300 text-xs px-2 py-1 rounded-full">
                  {room.topic}
                </span>
              )}
            </div>
          </div>

          {/* Room Description */}
          {room.description && (
            <p className="text-slate-400 text-sm mb-4 flex-1">
              {room.description}
            </p>
          )}

          {/* Room Stats */}
          <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <UserGroupIcon className="w-4 h-4" />
                <span>{room.activeParticipants || room.current_participants || 0}/{room.max_participants}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDate(room.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Room Creator */}
          <div className="text-xs text-slate-500 mb-4">
            Created by {room.creator_username || 'Unknown'}
            {isOwned && <span className="text-primary-400 ml-2">(You)</span>}
          </div>

          {/* Action Button */}
          <Link href={`/dashboard/rooms/${room.id}`}>
            <Button 
              variant="primary" 
              className="w-full"
              disabled={room.current_participants >= room.max_participants}
            >
              {room.current_participants >= room.max_participants ? (
                'Room Full'
              ) : (
                <>
                  <VideoCameraIcon className="w-4 h-4 mr-2" />
                  Join Room
                </>
              )}
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  );
}
