import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/lib/store/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

export type QueueUpdateType = 'CHECK_IN' | 'PROMOTED' | 'NO_SHOW' | 'UPDATE';

export interface QueueUpdatePayload {
  type: QueueUpdateType;
  doctorId: string;
  data: unknown;
}

export const useQueueSocket = (
  doctorId?: string,
  onQueueUpdate?: (payload: QueueUpdatePayload) => void,
) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.accessToken);

  // Latest Ref pattern to handle reference-unstable callbacks without re-triggering connection effect
  const callbackRef = useRef(onQueueUpdate);
  useEffect(() => {
    callbackRef.current = onQueueUpdate;
  });

  // Initialize socket connection & manage rooms in one single robust useEffect
  useEffect(() => {
    if (!token) {
      console.log('[QueueSocket] No access token found, skipping connection');
      return;
    }

    console.log('[QueueSocket] Initializing socket connection to:', `${SOCKET_URL}/queue`);
    const socketInstance = io(`${SOCKET_URL}/queue`, {
      transports: ['websocket'],
      autoConnect: true,
      auth: {
        token,
      },
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('[QueueSocket] Connected successfully, socket ID:', socketInstance.id);
      if (doctorId) {
        console.log(`[QueueSocket] Emitting joinDoctorRoom for doctorId: ${doctorId}`);
        socketInstance.emit('joinDoctorRoom', doctorId);
      }
    });

    socketInstance.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[QueueSocket] Disconnected. Reason:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[QueueSocket] Connection error:', error);
    });

    socketInstance.on('error', (err) => {
      console.error('[QueueSocket] Socket error:', err);
    });

    socketInstance.on('roomJoined', (room) => {
      console.log('[QueueSocket] Confirmed joined room:', room);
    });

    socketInstance.on('queueUpdated', (payload: QueueUpdatePayload) => {
      console.log('[QueueSocket] Received queueUpdated event payload:', payload);
      if (callbackRef.current) {
        callbackRef.current(payload);
      }
    });

    socketRef.current = socketInstance;

    // Handle initial state if connection is instantaneous
    if (socketInstance.connected && doctorId) {
      console.log(`[QueueSocket] Instant connection: emitting joinDoctorRoom for ${doctorId}`);
      socketInstance.emit('joinDoctorRoom', doctorId);
    }

    return () => {
      if (doctorId && socketInstance.connected) {
        console.log(`[QueueSocket] Cleaning up: emitting leaveDoctorRoom for ${doctorId}`);
        socketInstance.emit('leaveDoctorRoom', doctorId);
      }
      console.log('[QueueSocket] Disconnecting socket instance');
      socketInstance.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, doctorId]);

  return {
    isConnected,
  };
};

