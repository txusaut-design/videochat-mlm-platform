// src/components/video/VirtualBackground.tsx
'use client';

import { FC, useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

interface VirtualBackgroundProps {
  stream: MediaStream | null;
  onApplyBackground: (background: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

const backgroundOptions = [
  { id: 'none', name: 'No Background', preview: null },
  { id: 'blur', name: 'Blur Background', preview: 'blur' },
  { id: 'office', name: 'Office', preview: '/backgrounds/office.jpg' },
  { id: 'home', name: 'Home Office', preview: '/backgrounds/home.jpg' },
  { id: 'nature', name: 'Nature', preview: '/backgrounds/nature.jpg' },
  { id: 'abstract', name: 'Abstract', preview: '/backgrounds/abstract.jpg' },
];

const VirtualBackground: FC<VirtualBackgroundProps> = ({
  stream,
  onApplyBackground,
  isOpen,
  onClose
}) => {
  const [selectedBackground, setSelectedBackground] = useState<string>('none');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleApplyBackground = () => {
    onApplyBackground(selectedBackground === 'none' ? null : selectedBackground);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-4 w-80 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-xl p-4 z-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Virtual Background</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded-full transition-colors"
        >
          <XMarkIcon className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Preview */}
      <div className="mb-4">
        <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Background Options */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {backgroundOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedBackground(option.id)}
            className={`p-2 rounded-lg border transition-colors ${
              selectedBackground === option.id
                ? 'border-primary-500 bg-primary-500/20'
                : 'border-slate-600 hover:border-slate-500'
            }`}
          >
            <div className="aspect-video bg-slate-700 rounded mb-2 flex items-center justify-center">
              {option.preview === 'blur' ? (
                <div className="text-slate-400 text-xs">Blur</div>
              ) : option.preview ? (
                <PhotoIcon className="w-6 h-6 text-slate-400" />
              ) : (
                <div className="text-slate-400 text-xs">None</div>
              )}
            </div>
            <div className="text-xs text-slate-300 text-center">{option.name}</div>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button variant="ghost" size="small" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button variant="primary" size="small" onClick={handleApplyBackground} className="flex-1">
          Apply
        </Button>
      </div>
    </motion.div>
  );
};

export default VirtualBackground;