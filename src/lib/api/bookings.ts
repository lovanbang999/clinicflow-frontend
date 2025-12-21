import { apiClient } from './client';
import { Booking, CreateBookingDto, UpdateBookingStatusDto, BookingStatus } from '@/types';

export const bookingsApi = {
  // Get all bookings (với filters)
  getAll: async (params?: {
    status?: BookingStatus;
    doctorId?: string;
    patientId?: string;
    date?: string;
  }): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/bookings', { params });
    return response.data;
  },

  // Get my bookings (patient)
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await apiClient.get<Booking[]>('/bookings/my-bookings');
    return response.data;
  },

  // Get booking by ID
  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  // Create booking
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  // Update booking status
  updateStatus: async (id: string, data: UpdateBookingStatusDto): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/status`, data);
    return response.data;
  },

  // Cancel booking
  cancel: async (id: string, reason?: string): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  // Check-in booking (receptionist)
  checkIn: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/check-in`);
    return response.data;
  },

  // Start examination (doctor)
  startExamination: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/start`);
    return response.data;
  },

  // Complete booking (doctor)
  complete: async (id: string, doctorNotes?: string): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/complete`, { doctorNotes });
    return response.data;
  },

  // Mark as no-show (doctor)
  markNoShow: async (id: string): Promise<Booking> => {
    const response = await apiClient.patch<Booking>(`/bookings/${id}/no-show`);
    return response.data;
  },
};
