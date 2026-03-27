import api from './client';

export interface InAppNotification {
  id: string;
  type: 'APPOINTMENT_REMINDER' | 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'LAB_RESULT_READY' | 'INVOICE_ISSUED' | 'SYSTEM';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export const notificationsApi = {
  getMyNotifications: async () => {
    const { data } = await api.get<{ notifications: InAppNotification[]; unreadCount: number }>('/notifications/me');
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.patch<{ success: boolean }>(`/notifications/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.patch<{ success: boolean }>('/notifications/read-all');
    return data;
  },
};
