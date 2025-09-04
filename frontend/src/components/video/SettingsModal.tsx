// src/components/video/SettingsModal.tsx
'use client';

import { FC, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  VideoCameraIcon, 
  MicrophoneIcon,
  ComputerDesktopIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface DeviceInfo {
  videoDevices: MediaDeviceInfo[];
  audioDevices: MediaDeviceInfo[];
}

interface SelectedDevices {
  videoDeviceId?: string;
  audioDeviceId?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceInfo;
  selectedDevices: SelectedDevices;
  onSwitchCamera: (deviceId: string) => void;
  onSwitchMicrophone: (deviceId: string) => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  stream: MediaStream | null;
}

const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  devices,
  selectedDevices,
  onSwitchCamera,
  onSwitchMicrophone,
  isVideoEnabled,
  isAudioEnabled,
  onToggleVideo,
  onToggleAudio,
  stream
}) => {
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Update video preview
  useEffect(() => {
    if (videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);

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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Video Preview */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                    Video Preview
                  </h3>
                  <div className="bg-slate-900 rounded-lg overflow-hidden aspect-video max-w-sm">
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      muted
                      playsInline
                      className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                    />
                    {!isVideoEnabled && (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <div className="text-center">
                          <VideoCameraIcon className="w-12 h-12 mx-auto mb-2" />
                          <p>Camera Off</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Settings */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <VideoCameraIcon className="w-5 h-5 mr-2" />
                    Camera
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Camera Device
                      </label>
                      <select
                        value={selectedDevices.videoDeviceId || ''}
                        onChange={(e) => onSwitchCamera(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {devices.videoDevices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Camera Status</span>
                      <Button
                        variant={isVideoEnabled ? "secondary" : "ghost"}
                        size="small"
                        onClick={onToggleVideo}
                      >
                        {isVideoEnabled ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Audio Settings */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <MicrophoneIcon className="w-5 h-5 mr-2" />
                    Audio
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Microphone Device
                      </label>
                      <select
                        value={selectedDevices.audioDeviceId || ''}
                        onChange={(e) => onSwitchMicrophone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {devices.audioDevices.map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Microphone Status</span>
                      <Button
                        variant={isAudioEnabled ? "secondary" : "ghost"}
                        size="small"
                        onClick={onToggleAudio}
                      >
                        {isAudioEnabled ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Advanced Settings */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                    Advanced
                  </h3>
                  
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Video Resolution</span>
                        <p className="text-white">HD (1280x720)</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Frame Rate</span>
                        <p className="text-white">30 FPS</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Audio Quality</span>
                        <p className="text-white">High</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Echo Cancellation</span>
                        <p className="text-white">Enabled</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end mt-8">
                <Button variant="primary" onClick={onClose}>
                  Done
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;