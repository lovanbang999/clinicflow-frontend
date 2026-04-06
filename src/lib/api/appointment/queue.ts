import { apiClient } from '@/lib/api/core/client';
import { Booking, ApiResponse } from '@/types';

export interface QueueRecord {
  id: string;
  bookingId: string;
  doctorId: string;
  queueDate: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  isPreBooked: boolean;      // Priority sort: pre-bookings with due time get called first
  scheduledTime?: string | null; // Denorm from Booking.startTime
  booking: Booking;
}

export interface QueuePagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueueListResponse {
  queueRecords: QueueRecord[];
  pagination: QueuePagination;
}

export interface QueueStats {
  totalQueued: number;
  averageWaitTimeMinutes: number;
  longestQueuePosition: number;
}

export const queueApi = {
  // Get all queued bookings
  getAll: async (params?: {
    doctorId?: string;
    date?: string;
    timeSlot?: string;
    page?: number;
    limit?: number;
  }): Promise<QueueListResponse> => {
    const response = await apiClient.get<ApiResponse<QueueListResponse>>('/queue', { params });
    return response.data.data!;
  },

  // Get queue statistics
  getStatistics: async (doctorId?: string, date?: string): Promise<QueueStats> => {
    const response = await apiClient.get<{ data: QueueStats }>('/queue/statistics', {
      params: { doctorId, date },
    });
    return response.data.data;
  },

  // Get queue info by booking ID
  getByBookingId: async (bookingId: string): Promise<QueueRecord> => {
    const response = await apiClient.get<{ data: QueueRecord }>(`/queue/booking/${bookingId}`);
    return response.data.data;
  },

  // Promote a booking manually
  promote: async (bookingId: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.post<{ data: Booking }>('/queue/promote', {
      bookingId,
      reason,
    });
    return response.data.data;
  },
};
