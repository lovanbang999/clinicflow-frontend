import { apiClient } from './client';
import { Booking, CreateBookingDto, UpdateBookingStatusDto, BookingStatus } from '@/types';

export const bookingsApi = {
  // Get all bookings (with filters)
  getAll: async (params?: {
    status?: BookingStatus | string;
    doctorId?: string;
    patientProfileId?: string;
    date?: string;
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
    const response = await apiClient.get<Booking>(`/bookings/${id}`);
    return response.data;
  },

  // Create booking
  create: async (data: CreateBookingDto): Promise<Booking> => {
    const response = await apiClient.post<Booking>('/bookings', data);
    return response.data;
  },

  // Create receptionist booking (Auto confirmed)
  createReceptionistBooking: async (data: CreateBookingDto): Promise<Booking> => {
    // Wrap to response.data.data because create api usually returns { data, ... } depending on backend response format, but looking above create() returns response.data directly. Let's check getById: response.data. Oh wait, backend returns ResponseHelper.success which is {data, success, etc}. Let's adapt if needed.
    const response = await apiClient.post<{ data: Booking }>('/bookings/receptionist', data);
    return response.data.data;
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
