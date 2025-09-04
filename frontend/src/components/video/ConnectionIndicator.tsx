// src/components/video/ConnectionIndicator.tsx
'use client';

import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  SignalIcon,
  SignalSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  quality?: 'excellent' | 'good' | 'fair' | 'poor';
  className?: string;
}

const ConnectionIndicator: FC<ConnectionIndicatorProps> = ({
  isConnected,
  quality = 'good',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 3 seconds if connection is good
    if (isConnected && quality === 'excellent') {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [isConnected, quality]);

  if (!isVisible) return null;

  const getIndicatorColor = () => {
    if (!isConnected) return 'text-red-400 bg-red-400/20';
    
    switch (quality) {
      case 'excellent': return 'text-green-400 bg-green-400/20';
      case 'good': return 'text-green-400 bg-green-400/20';
      case 'fair': return 'text-yellow-400 bg-yellow-400/20';
      case 'poor': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getIndicatorText = () => {
    if (!isConnected) return 'Disconnected';
    
    switch (quality) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return 'Unknown';
    }
  };

  const getIcon = () => {
    if (!isConnected) return SignalSlashIcon;
    if (quality === 'poor') return ExclamationTriangleIcon;
    return SignalIcon;
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getIndicatorColor()} ${className}`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{getIndicatorText()}</span>
    </motion.div>
  );
};

export default ConnectionIndicator;