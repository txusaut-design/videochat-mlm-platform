// src/hooks/useMediaDevices.ts
import { useState, useRef, useCallback, useEffect } from 'react';

interface MediaDevicesState {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  devices: {
    videoDevices: MediaDeviceInfo[];
    audioDevices: MediaDeviceInfo[];
  };
  selectedDevices: {
    videoDeviceId?: string;
    audioDeviceId?: string;
  };
}

export function useMediaDevices() {
  const [state, setState] = useState<MediaDevicesState>({
    stream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    devices: {
      videoDevices: [],
      audioDevices: [],
    },
    selectedDevices: {},
  });

  const streamRef = useRef<MediaStream | null>(null);

  // Get available devices
  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');

      setState(prev => ({
        ...prev,
        devices: { videoDevices, audioDevices }
      }));
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  }, []);

  // Start user media
  const startUserMedia = useCallback(async (constraints?: MediaStreamConstraints) => {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          deviceId: state.selectedDevices.videoDeviceId ? { exact: state.selectedDevices.videoDeviceId } : undefined
        },
        audio: {
          deviceId: state.selectedDevices.audioDeviceId ? { exact: state.selectedDevices.audioDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints || defaultConstraints);
      
      streamRef.current = stream;
      setState(prev => ({ ...prev, stream }));
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, [state.selectedDevices]);

  // Stop user media
  const stopUserMedia = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setState(prev => ({ ...prev, stream: null, isScreenSharing: false }));
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setState(prev => ({ ...prev, isVideoEnabled: videoTrack.enabled }));
      }
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setState(prev => ({ ...prev, isAudioEnabled: audioTrack.enabled }));
      }
    }
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Keep audio from user media
      const audioTrack = streamRef.current?.getAudioTracks()[0];
      if (audioTrack) {
        screenStream.addTrack(audioTrack);
      }

      // Stop current stream
      if (streamRef.current) {
        streamRef.current.getVideoTracks().forEach(track => track.stop());
      }

      streamRef.current = screenStream;
      setState(prev => ({ 
        ...prev, 
        stream: screenStream, 
        isScreenSharing: true 
      }));

      // Handle screen share end
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, []);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (streamRef.current && state.isScreenSharing) {
      streamRef.current.getVideoTracks().forEach(track => track.stop());
      
      // Restart user media
      try {
        await startUserMedia();
        setState(prev => ({ ...prev, isScreenSharing: false }));
      } catch (error) {
        console.error('Error restarting user media:', error);
      }
    }
  }, [state.isScreenSharing, startUserMedia]);

  // Switch camera device
  const switchCamera = useCallback(async (deviceId: string) => {
    setState(prev => ({
      ...prev,
      selectedDevices: { ...prev.selectedDevices, videoDeviceId: deviceId }
    }));

    if (streamRef.current) {
      stopUserMedia();
      await startUserMedia();
    }
  }, [stopUserMedia, startUserMedia]);

  // Switch microphone device
  const switchMicrophone = useCallback(async (deviceId: string) => {
    setState(prev => ({
      ...prev,
      selectedDevices: { ...prev.selectedDevices, audioDeviceId: deviceId }
    }));

    if (streamRef.current) {
      stopUserMedia();
      await startUserMedia();
    }
  }, [stopUserMedia, startUserMedia]);

  // Initialize devices on mount
  useEffect(() => {
    getDevices();
  }, [getDevices]);

  return {
    ...state,
    startUserMedia,
    stopUserMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    switchMicrophone,
    getDevices,
  };
}
