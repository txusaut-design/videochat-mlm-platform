// src/components/video/VideoGrid.tsx
'use client';

import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import { RoomParticipant } from '@/lib/types';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: RoomParticipant[];
  currentUserId: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const VideoGrid: FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  participants,
  currentUserId,
  isVideoEnabled,
  isAudioEnabled
}) => {
  const totalParticipants = participants.length;
  
  // Calculate grid layout based on participant count
  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    if (count <= 9) return 'grid-cols-3 grid-rows-3';
    return 'grid-cols-4 grid-rows-3'; // Maximum 12 participants visible
  };

  const gridLayout = getGridLayout(totalParticipants);

  return (
    <div className="flex-1 p-4">
      <div className={`grid gap-4 h-full ${gridLayout}`}>
        <AnimatePresence>
          {/* Local video (current user) */}
          <motion.div
            key={`local-${currentUserId}`}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative"
          >
            <VideoPlayer
              stream={localStream || undefined}
              username="You"
              isLocal={true}
              isMuted={!isAudioEnabled}
              isVideoOff={!isVideoEnabled}
              className="w-full h-full min-h-[200px]"
            />
          </motion.div>

          {/* Remote videos */}
          {participants
            .filter(participant => participant.userId !== currentUserId)
            .slice(0, 11) // Limit to 11 remote participants + 1 local = 12 total
            .map((participant) => {
              const stream = remoteStreams.get(participant.id);
              return (
                <motion.div
                  key={`remote-${participant.userId}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative"
                >
                  <VideoPlayer
                    stream={stream}
                    username={participant.username}
                    isLocal={false}
                    className="w-full h-full min-h-[200px]"
                  />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* More participants indicator */}
      {totalParticipants > 12 && (
        <div className="absolute bottom-20 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3">
          <p className="text-slate-300 text-sm">
            +{totalParticipants - 12} more participants
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;