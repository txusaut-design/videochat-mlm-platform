// src/app/dashboard/rooms/[roomId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuthStore } from '@/store/authStore';
import { useVideoRoom } from '@/hooks/useVideoRoom';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { useWebRTC } from '@/hooks/useWebRTC';

import VideoGrid from '@/components/video/VideoGrid';
import VideoControls from '@/components/video/VideoControls';
import ChatPanel from '@/components/video/ChatPanel';
import JoinRoomModal from '@/components/video/JoinRoomModal';
import SettingsModal from '@/components/video/SettingsModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function VideoRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const { user } = useAuthStore();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  // Video room hook
  const {
    socket,
    currentRoom,
    participants,
    isInRoom,
    messages,
    joinRoom,
    leaveRoom,
    sendMessage,
  } = useVideoRoom(roomId);

  // Media devices hook
  const {
    stream: localStream,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    devices,
    selectedDevices,
    startUserMedia,
    stopUserMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    switchMicrophone,
  } = useMediaDevices();

  // WebRTC hook
  const { peers, remoteStreams } = useWebRTC({
    socket,
    roomId,
    userId: user?.id || '',
    localStream,
  });

  // Initialize media and join room
  useEffect(() => {
    const initializeRoom = async () => {
      if (!user?.hasActiveMembership) {
        toast.error('Active membership required');
        router.push('/dashboard/payments');
        return;
      }

      try {
        setIsConnecting(true);
        
        // Start user media first
        await startUserMedia();
        
        // Try to join the room
        const joined = await joinRoom(roomId);
        
        if (!joined) {
          setShowJoinModal(true);
        }
      } catch (error) {
        console.error('Error initializing room:', error);
        toast.error('Failed to access camera/microphone');
      } finally {
        setIsConnecting(false);
      }
    };

    if (roomId && user) {
      initializeRoom();
    }

    return () => {
      stopUserMedia();
    };
  }, [roomId, user]);

  // Handle join with password
  const handleJoinWithPassword = async (password?: string) => {
    try {
      const joined = await joinRoom(roomId, password);
      if (joined) {
        setShowJoinModal(false);
      }
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  // Handle leave room
  const handleLeaveRoom = () => {
    leaveRoom();
    stopUserMedia();
  };

  // Handle screen share toggle
  const handleToggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
        socket?.emit('stop-screen-share');
      } else {
        await startScreenShare();
        socket?.emit('start-screen-share');
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast.error('Failed to toggle screen share');
    }
  };

  // Handle audio/video toggle with socket events
  const handleToggleAudio = () => {
    toggleAudio();
    socket?.emit('toggle-audio', { muted: !isAudioEnabled });
  };

  const handleToggleVideo = () => {
    toggleVideo();
    socket?.emit('toggle-video', { muted: !isVideoEnabled });
  };

  // Redirect if no membership
  if (!user?.hasActiveMembership) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Membership Required</h3>
          <p className="text-slate-400 mb-6">
            You need an active membership to join video rooms.
          </p>
          <Button variant="primary" onClick={() => router.push('/dashboard/payments')}>
            Purchase Membership
          </Button>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" className="mb-4" />
          <p className="text-slate-400">Connecting to room...</p>
        </div>
      </div>
    );
  }

  // Not in room (show join modal)
  if (!isInRoom) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold text-white mb-4">
              {currentRoom ? `Join ${currentRoom.name}` : 'Room Not Found'}
            </h3>
            <p className="text-slate-400 mb-6">
              {currentRoom 
                ? 'Click below to join this video room'
                : 'This room may not exist or may have been deleted'
              }
            </p>
            {currentRoom ? (
              <Button variant="primary" onClick={() => setShowJoinModal(true)}>
                Join Room
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => router.push('/dashboard/rooms')}>
                Back to Rooms
              </Button>
            )}
          </Card>
        </div>

        <JoinRoomModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinWithPassword}
          room={currentRoom}
        />
      </>
    );
  }

  return (
    <div className="h-screen bg-slate-900 relative overflow-hidden">
      {/* Room Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-4 left-4 z-10"
      >
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg px-4 py-2">
          <h2 className="text-white font-semibold">{currentRoom?.name}</h2>
          <p className="text-slate-400 text-sm">
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
          </p>
        </div>
      </motion.div>

      {/* Video Grid */}
      <VideoGrid
        localStream={localStream}
        remoteStreams={remoteStreams}
        participants={participants}
        currentUserId={user?.id || ''}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
      />

      {/* Video Controls */}
      <VideoControls
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isScreenSharing={isScreenSharing}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        onToggleScreenShare={handleToggleScreenShare}
        onLeaveRoom={handleLeaveRoom}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        participantCount={participants.length}
      />

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={messages}
        onSendMessage={sendMessage}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        devices={devices}
        selectedDevices={selectedDevices}
        onSwitchCamera={switchCamera}
        onSwitchMicrophone={switchMicrophone}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        stream={localStream}
      />
    </div>
  );
}
