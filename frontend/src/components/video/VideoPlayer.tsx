// src/components/video/VideoPlayer.tsx
'use client';

import { useEffect, useRef, FC } from 'react';
import { motion } from 'framer-motion';
import { 
  MicrophoneIcon, 
  XMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

interface VideoPlayerProps {
  stream?: MediaStream;
  username: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  className?: string;
}

const VideoPlayer: FC<VideoPlayerProps> = ({
  stream,
  username,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`relative bg-slate-800 rounded-xl overflow-hidden ${className}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted={isLocal} // Always mute local video to prevent echo
        playsInline
        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
      />

      {/* Avatar when video is off */}
      {(isVideoOff || !stream) && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
          <div className="text-center">
            <UsersIcon className="w-16 h-16 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-300 font-medium">{username}</p>
          </div>
        </div>
      )}

      {/* username and status overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm">
            {username} {isLocal && '(You)'}
          </span>
          
          <div className="flex items-center space-x-2">
            {isMuted ? (
              <XMarkIcon className="w-4 h-4 text-red-400" />
            ) : (
              <MicrophoneIcon className="w-4 h-4 text-green-400" />
            )}
            
            {isVideoOff ? (
              <VideoCameraSlashIcon className="w-4 h-4 text-red-400" />
            ) : (
              <VideoCameraIcon className="w-4 h-4 text-green-400" />
            )}
          </div>
        </div>
      </div>

      {/* Connection status indicator */}
      <div className="absolute top-2 right-2">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </motion.div>
  );
};

export default VideoPlayer;