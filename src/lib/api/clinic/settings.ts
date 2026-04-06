import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types';

export interface ClinicProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logoUrl: string;
}

export interface BookingRules {
  openTime: string;
  closeTime: string;
  slotDuration: number;
  noShowGraceMinutes: number;
  cancelationWindowHours: number;
  allowOnlineBooking: boolean;
}

export interface NotificationConfig {
  enableEmailReminders: boolean;
  enableSmsReminders: boolean;
  reminderSchedule: string;
  smtpHost: string;
  smtpPort: string;
}

export interface AdminSettings {
  clinic: ClinicProfile;
  booking: BookingRules;
  notification: NotificationConfig;
  security: Record<string, unknown>;
}

export const settingsApi = {
  getAllSettings: async (): Promise<AdminSettings> => {
    const response = await apiClient.get<ApiResponse<AdminSettings>>('/admin/settings');
    if (!response.data.data) throw new Error('Failed to fetch admin settings');
    return response.data.data;
  },

  updateClinicProfile: async (data: Partial<ClinicProfile>): Promise<ClinicProfile> => {
    const response = await apiClient.patch<ApiResponse<ClinicProfile>>('/admin/settings/clinic-profile', data);
    if (!response.data.data) throw new Error('Failed to update clinic profile');
    return response.data.data;
  },

  updateBookingRules: async (data: Partial<BookingRules>): Promise<BookingRules> => {
    const response = await apiClient.patch<ApiResponse<BookingRules>>('/admin/settings/booking-rules', data);
    if (!response.data.data) throw new Error('Failed to update booking rules');
    return response.data.data;
  },

  updateNotifications: async (data: Partial<NotificationConfig>): Promise<NotificationConfig> => {
    const response = await apiClient.patch<ApiResponse<NotificationConfig>>('/admin/settings/notifications', data);
    if (!response.data.data) throw new Error('Failed to update notifications');
    return response.data.data;
  },
};
