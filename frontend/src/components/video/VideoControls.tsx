// src/components/video/VideoControls.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import {
  MicrophoneIcon,
  XMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  ComputerDesktopIcon,
  PhoneXMarkIcon,
  CogIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface VideoControlsProps {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onToggleScreenShare: () => void;
  onLeaveRoom: () => void;
  onOpenSettings: () => void;
  onToggleChat: () => void;
  participantCount: number;
}

const VideoControls: FC<VideoControlsProps> = ({
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onLeaveRoom,
  onOpenSettings,
  onToggleChat,
  participantCount
}) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10"
    >
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600 rounded-2xl px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Audio Control */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isAudioEnabled ? (
              <MicrophoneIcon className="w-6 h-6" />
            ) : (
              <XMarkIcon className="w-6 h-6" />
            )}
          </motion.button>

          {/* Video Control */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isVideoEnabled ? (
              <VideoCameraIcon className="w-6 h-6" />
            ) : (
              <VideoCameraSlashIcon className="w-6 h-6" />
            )}
          </motion.button>

          {/* Screen Share Control */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleScreenShare}
            className={`p-3 rounded-full transition-colors ${
              isScreenSharing
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            <ComputerDesktopIcon className="w-6 h-6" />
          </motion.button>

          {/* Chat Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onToggleChat}
            className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors relative"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </motion.button>

          {/* Settings */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onOpenSettings}
            className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
          >
            <CogIcon className="w-6 h-6" />
          </motion.button>

          {/* Separator */}
          <div className="w-px h-8 bg-slate-600"></div>

          {/* Participant Count */}
          <div className="text-slate-300 text-sm font-medium px-2">
            {participantCount} participant{participantCount !== 1 ? 's' : ''}
          </div>

          {/* Leave Room */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLeaveRoom}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <PhoneXMarkIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoControls;
