import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

export interface NewLabOrderPayload {
  labOrderIds: string[];
  patientName: string;
  invoiceId: string;
}

export interface LabResultCompletedPayload {
  labOrderId: string;
  testName: string;
}

export const useLabOrderSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/lab-orders`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinLabRoom');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[LabOrderSocket] connection error:', err);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const onNewLabOrder = useCallback(
    (callback: (payload: NewLabOrderPayload) => void) => {
      const socket = socketRef.current;
      if (!socket) return;

      socket.on('newLabOrder', callback);
      return () => {
        socket.off('newLabOrder', callback);
      };
    },
    [],
  );

  /** Doctor: join a booking-specific room to receive lab result notifications */
  const joinBookingLabRoom = useCallback((bookingId: string) => {
    socketRef.current?.emit('joinBookingLabRoom', bookingId);
  }, []);

  /** Doctor: leave a booking-specific room (call on unmount) */
  const leaveBookingLabRoom = useCallback((bookingId: string) => {
    socketRef.current?.emit('leaveBookingLabRoom', bookingId);
  }, []);

  /** Doctor: subscribe to labResultCompleted event for a booking */
  const onLabResultCompleted = useCallback(
    (callback: (payload: LabResultCompletedPayload) => void) => {
      const socket = socketRef.current;
      if (!socket) return;

      socket.on('labResultCompleted', callback);
      return () => {
        socket.off('labResultCompleted', callback);
      };
    },
    [],
  );

  return { isConnected, onNewLabOrder, joinBookingLabRoom, leaveBookingLabRoom, onLabResultCompleted };
};
