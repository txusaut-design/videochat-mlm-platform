// src/components/video/ParticipantsList.tsx
'use client';

import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserGroupIcon,
  MicrophoneIcon,
  MicrophoneSlashIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { RoomParticipant } from '@/lib/types';
import Card from '@/components/ui/Card';

interface ParticipantsListProps {
  participants: RoomParticipant[];
  currentUserId: string;
  className?: string;
}

const ParticipantsList: FC<ParticipantsListProps> = ({
  participants,
  currentUserId,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxVisible = 3;
  const hasMore = participants.length > maxVisible;

  return (
    <Card padding="small" className={className}>
      <div className="space-y-2">
        {/* Header */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => hasMore && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">
              Participants ({participants.length})
            </span>
          </div>
          
          {hasMore && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </motion.div>
          )}
        </div>

        {/* Participants List */}
        <div className="space-y-2">
          <AnimatePresence>
            {participants
              .slice(0, isExpanded ? participants.length : maxVisible)
              .map((participant, index) => (
                <motion.div
                  key={participant.user_id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {participant.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-slate-300">
                      {participant.username}
                      {participant.user_id === currentUserId && ' (You)'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <MicrophoneIcon className="w-3 h-3 text-green-400" />
                    <VideoCameraIcon className="w-3 h-3 text-green-400" />
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
          
          {hasMore && !isExpanded && (
            <div className="text-xs text-slate-500 text-center py-1">
              +{participants.length - maxVisible} more
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ParticipantsList;