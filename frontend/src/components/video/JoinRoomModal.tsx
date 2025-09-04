// src/components/video/JoinRoomModal.tsx
'use client';

import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, LockClosedIcon, UserGroupIcon } from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Room } from '@/lib/types';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (password?: string) => void;
  room: Room | null;
}

const JoinRoomModal: FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  room
}) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await onJoin(room?.is_private ? password : undefined);
    } finally {
      setIsLoading(false);
    }
  };

  if (!room) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md"
          >
            <Card>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Join Room</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Room Info */}
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{room.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {room.current_participants}/{room.max_participants} participants
                    </p>
                  </div>
                </div>

                {room.description && (
                  <p className="text-slate-400 text-sm mb-4">{room.description}</p>
                )}

                {room.topic && (
                  <span className="inline-block bg-primary-600/20 text-primary-300 text-xs px-2 py-1 rounded-full">
                    {room.topic}
                  </span>
                )}
              </div>

              {/* Private Room Password */}
              {room.is_private && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <LockClosedIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm">Private Room</span>
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter room password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleJoin}
                  loading={isLoading}
                  className="flex-1"
                  disabled={room.is_private && !password}
                >
                  Join Room
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default JoinRoomModal;