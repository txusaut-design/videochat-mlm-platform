// src/components/video/RecordingIndicator.tsx
'use client';

import { FC } from 'react';
import { motion } from 'framer-motion';
import { VideoCameraIcon } from '@heroicons/react/24/solid';

interface RecordingIndicatorProps {
  isRecording: boolean;
  duration?: string;
}

const RecordingIndicator: FC<RecordingIndicatorProps> = ({ 
  isRecording, 
  duration = '00:00' 
}) => {
  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 bg-red-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center space-x-2 z-10"
    >
      <motion.div
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-3 h-3 bg-red-300 rounded-full"
      />
      <VideoCameraIcon className="w-4 h-4" />
      <span className="text-sm font-medium">REC {duration}</span>
    </motion.div>
  );
};

export default RecordingIndicator;