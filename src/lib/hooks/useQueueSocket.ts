import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

export type QueueUpdateType = 'CHECK_IN' | 'PROMOTED' | 'NO_SHOW' | 'UPDATE';

export interface QueueUpdatePayload {
  type: QueueUpdateType;
  doctorId: string;
  data: unknown;
}

export const useQueueSocket = (doctorId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(`${SOCKET_URL}/queue`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to queue socket namespace [/queue]');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from queue socket');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current = socketInstance;

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Handle room joining/leaving when doctorId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !doctorId || !isConnected) return;

    console.log(`Joining doctor room: ${doctorId}`);
    socket.emit('joinDoctorRoom', doctorId);

    return () => {
      if (isConnected && socketRef.current) {
        console.log(`Leaving doctor room: ${doctorId}`);
        socketRef.current.emit('leaveDoctorRoom', doctorId);
      }
    };
  }, [doctorId, isConnected]);

  const onQueueUpdate = useCallback((callback: (payload: QueueUpdatePayload) => void) => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on('queueUpdated', callback);
    return () => {
      socket.off('queueUpdated', callback);
    };
  }, []);

  return {
    isConnected,
    onQueueUpdate,
  };
};
