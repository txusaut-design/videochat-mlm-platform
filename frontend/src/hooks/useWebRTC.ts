// src/hooks/useWebRTC.ts
import { useRef, useEffect, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';

interface PeerConnection {
  peer: Peer.Instance;
  userId: string;
  stream?: MediaStream;
}

interface UseWebRTCProps {
  socket: Socket | null;
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
}

export function useWebRTC({ socket, roomId, userId, localStream }: UseWebRTCProps) {
  const [peers, setPeers] = useState<Map<string, PeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());

  // Create peer connection
  const createPeer = useCallback((userToCall: string, callerID: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket?.emit('offer', { to: userToCall, offer: signal });
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStreams(prev => new Map(prev.set(userToCall, remoteStream)));
    });

    peer.on('error', (error) => {
      console.error('Peer error:', error);
    });

    peer.on('close', () => {
      handleUserLeft(userToCall);
    });

    const peerConnection: PeerConnection = {
      peer,
      userId: userToCall,
      stream
    };

    peersRef.current.set(userToCall, peerConnection);
    setPeers(new Map(peersRef.current));

    return peer;
  }, [socket]);

  // Add peer (when receiving call)
  const addPeer = useCallback((incomingSignal: any, callerID: string, stream: MediaStream) => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket?.emit('answer', { to: callerID, answer: signal });
    });

    peer.on('stream', (remoteStream) => {
      setRemoteStreams(prev => new Map(prev.set(callerID, remoteStream)));
    });

    peer.on('error', (error) => {
      console.error('Peer error:', error);
    });

    peer.on('close', () => {
      handleUserLeft(callerID);
    });

    peer.signal(incomingSignal);

    const peerConnection: PeerConnection = {
      peer,
      userId: callerID,
      stream
    };

    peersRef.current.set(callerID, peerConnection);
    setPeers(new Map(peersRef.current));

    return peer;
  }, [socket]);

  // Handle user joined
  const handleUserJoined = useCallback((data: { userId: string; socketId: string }) => {
    if (localStream && data.userId !== userId) {
      createPeer(data.socketId, userId, localStream);
    }
  }, [createPeer, localStream, userId]);

  // Handle user left
  const handleUserLeft = useCallback((socketId: string) => {
    const peerConnection = peersRef.current.get(socketId);
    if (peerConnection) {
      peerConnection.peer.destroy();
      peersRef.current.delete(socketId);
      setPeers(new Map(peersRef.current));
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(socketId);
        return newMap;
      });
    }
  }, []);

  // Handle WebRTC signals
  useEffect(() => {
    if (!socket) return;

    socket.on('offer', ({ from, fromUserId, offer }) => {
      if (localStream) {
        addPeer(offer, from, localStream);
      }
    });

    socket.on('answer', ({ from, answer }) => {
      const peerConnection = peersRef.current.get(from);
      if (peerConnection) {
        peerConnection.peer.signal(answer);
      }
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      const peerConnection = peersRef.current.get(from);
      if (peerConnection) {
        peerConnection.peer.signal(candidate);
      }
    });

    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-joined');
      socket.off('user-left');
    };
  }, [socket, localStream, addPeer, handleUserJoined, handleUserLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peersRef.current.forEach((peerConnection) => {
        peerConnection.peer.destroy();
      });
      peersRef.current.clear();
      setPeers(new Map());
      setRemoteStreams(new Map());
    };
  }, []);

  return {
    peers,
    remoteStreams,
  };
}