import api from './client';

export interface InAppNotification {
  id: string;
  type: 'BOOKING_CONFIRMED' | 'BOOKING_REMINDER' | 'BOOKING_CANCELLED' | 'LAB_RESULT' | 'GENERAL';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
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
