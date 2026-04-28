import { useState, useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';
import { InAppNotification, notificationsApi } from '@/lib/api/clinic/notifications';
import { useAuthStore } from '@/lib/store/authStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';

export function useNotifications() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { execute: executeFetch, isLoading: loading } = useApiHandler();
  const { execute: executeAction } = useApiHandler();
  const { user } = useAuthStore();
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = useCallback(async () => {
    const data = await executeFetch(
      () => notificationsApi.getMyNotifications(),
      { showErrorToast: false } // silent fail usually for meta-data like notifications
    );
    if (data) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    }
  }, [executeFetch]);

  // WebSocket Connection
  useEffect(() => {
    if (!user?.id) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      socket.emit('authenticate', { userId: user.id, role: user.role });
    });

    socket.on('newNotification', (newNotif: InAppNotification) => {
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, user?.role]);

  const markAsRead = async (id: string) => {
    await executeAction(
      async () => {
        await notificationsApi.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      },
      { showErrorToast: false }
    );
  };

  const markAllAsRead = async () => {
    await executeAction(
      async () => {
        await notificationsApi.markAllAsRead();
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      },
      { showErrorToast: false }
    );
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  refetch: fetchNotifications,
  onNewNotification: (callback: (notif: InAppNotification) => void) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.on('newNotification', callback);
    return () => {
      socket.off('newNotification', callback);
    };
  },
};
}
