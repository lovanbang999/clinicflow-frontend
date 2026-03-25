import { apiClient } from './client';
import { Booking, CreateBookingDto, UpdateBookingStatusDto, BookingStatus, DashboardData } from '@/types';

export interface StatTrend {
  value: number;
  trend: number;
  trendDir: 'up' | 'down' | 'neutral';
}

export interface ReceptionistStatsResponse {
  pending: StatTrend;
  confirmed: StatTrend;
  completed: StatTrend;
  cancelled: StatTrend;
}

export const bookingsApi = {
  // Get all bookings (with filters)
  getAll: async (params?: {
    status?: BookingStatus | string;
    doctorId?: string;
    serviceId?: string;
    patientProfileId?: string;
    date?: string;
    search?: string;
    limit?: number;
    page?: number;
  }): Promise<{ bookings: Booking[], pagination: Record<string, unknown> }> => {
    const response = await apiClient.get<{ data: { bookings: Booking[], pagination: Record<string, unknown> } }>('/bookings', { params });
    return response.data.data;
  },

  // Get my bookings (patient)
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<{ data: { bookings: Booking[] } }>('/bookings/my-bookings');
    return response.data.data.bookings;
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<{ data: Booking }>(`/bookings/${id}`);
    return response.data.data;
  },

  // Create booking
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await apiClient.post<{ data: Booking }>('/bookings', data);
    return response.data.data;
  },

  // Create receptionist booking (Auto confirmed)
  createReceptionistBooking: async (data: CreateBookingDto): Promise<Booking> => {
    // Wrap to response.data.data because create api usually returns { data, ... } depending on backend response format, but looking above create() returns response.data directly. Let's check getById: response.data. Oh wait, backend returns ResponseHelper.success which is {data, success, etc}. Let's adapt if needed.
    const response = await apiClient.post<{ data: Booking }>('/bookings/receptionist', data);
    return response.data.data;
  },

  // Update booking status
  updateStatus: async (id: string, data: UpdateBookingStatusDto): Promise<Booking> => {
    const response = await apiClient.patch<{ data: Booking }>(`/bookings/${id}/status`, data);
    return response.data.data;
  },

  // Cancel booking
  cancel: async (id: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.patch<{ data: Booking }>(`/bookings/${id}/cancel`, { reason });
    return response.data.data;
  },

  // Check-in booking (receptionist)
  checkIn: async (id: string): Promise<{ booking: Booking; queue: { queuePosition: number; estimatedWaitMinutes: number } }> => {
    const response = await apiClient.post<{ data: { booking: Booking; queue: { queuePosition: number; estimatedWaitMinutes: number } } }>(`/bookings/${id}/check-in`);
    return response.data.data;
  },

  // Start examination (doctor)
  startExamination: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<{ data: Booking }>(`/bookings/${id}/start`);
    return response.data.data;
  },

  // Complete booking (doctor)
  complete: async (id: string, doctorNotes?: string): Promise<Booking> => {
    const response = await apiClient.patch<{ data: Booking }>(`/bookings/${id}/complete`, { doctorNotes });
    return response.data.data;
  },

  // Mark as no-show (doctor)
  markNoShow: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<{ data: Booking }>(`/bookings/${id}/no-show`);
    return response.data.data;
  },

  // Get receptionist check-in stats
  getReceptionistStats: async (): Promise<ReceptionistStatsResponse> => {
    const response = await apiClient.get<{ data: ReceptionistStatsResponse }>('/bookings/dashboard/receptionist-stats');
    return response.data.data;
  },

  // Get patient dashboard stats
  getPatientDashboardStats: async (): Promise<DashboardData> => {
    const response = await apiClient.get<{ data: DashboardData }>('/bookings/dashboard/stats');
    return response.data.data;
  },
};
