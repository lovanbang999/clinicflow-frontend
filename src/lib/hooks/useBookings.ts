import { useState, useCallback } from 'react';
import { bookingsApi, ReceptionistStatsResponse } from '../api/bookings';
import { CreateBookingDto, Booking, BookingStatus } from '@/types';
import { useApiHandler } from './useApiHandler';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { execute, isLoading, error } = useApiHandler();

  // Fetch my bookings
  const fetchMyBookings = useCallback(async (): Promise<Booking[]> => {
    const res = await execute(
      async () => {
        const data = await bookingsApi.getMyBookings();
        setBookings(data);
        return data;
      },
      { errorFallbackMsg: 'Failed to load appointments' }
    );
    return res || [];
  }, [execute]);

  // Fetch all bookings with filters
  const fetchBookings = useCallback(async (params?: {
    status?: BookingStatus | string;
    doctorId?: string;
    serviceId?: string;
    patientProfileId?: string;
    date?: string;
    search?: string;
  }): Promise<{ bookings: Booking[], pagination: Record<string, unknown> } | null> => {
    return execute(
      async () => {
        const data = await bookingsApi.getAll(params);
        setBookings(data.bookings);
        return data;
      },
      { errorFallbackMsg: 'Failed to load bookings' }
    ).then(res => res || null);
  }, [execute]);

  // Create booking
  const createBooking = useCallback(async (data: CreateBookingDto): Promise<Booking | null> => {
    return execute(
      async () => {
        const booking = await bookingsApi.create(data);
        return booking;
      },
      { 
        onSuccessMsg: 'Booking created successfully',
        errorFallbackMsg: 'Đặt lịch thất bại. Vui lòng thử lại.' 
      }
    ).then(res => res || null);
  }, [execute]);

  // Cancel booking
  const cancelBooking = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    const res = await execute(
      async () => {
        await bookingsApi.cancel(id, reason);
        return true;
      },
      { 
        onSuccessMsg: 'Appointment cancelled successfully',
        errorFallbackMsg: 'Failed to cancel appointment',
        onError: () => {}
      }
    );
    return res === true;
  }, [execute]);

  // Get booking by ID
  const getBookingById = useCallback(async (id: string): Promise<Booking | null> => {
    return execute(
      async () => {
        const booking = await bookingsApi.getById(id);
        return booking;
      },
      { errorFallbackMsg: 'Failed to load booking details' }
    ).then(res => res || null);
  }, [execute]);

  // Fetch receptionist check-in stats
  const fetchReceptionistStats = useCallback(async (): Promise<ReceptionistStatsResponse | null> => {
    return execute(
      async () => {
        return await bookingsApi.getReceptionistStats();
      },
      { errorFallbackMsg: 'Failed to load booking statistics' }
    ).then(res => res || null);
  }, [execute]);

  // Check-in patient
  const checkInPatient = useCallback(async (id: string) => {
    return execute(
      async () => {
        const data = await bookingsApi.checkIn(id);
        return data;
      },
      { errorFallbackMsg: 'Failed to check-in patient' }
    ).then(res => res || null);
  }, [execute]);

  // Complete booking (Finish visit)
  const completeBooking = useCallback(async (id: string) => {
    const res = await execute(
      async () => {
        await bookingsApi.complete(id);
        return true;
      },
      { 
        errorFallbackMsg: 'Failed to complete visit',
        onError: () => {}
      }
    );
    return res === true;
  }, [execute]);

  return {
    bookings,
    isLoading,
    error,
    fetchMyBookings,
    fetchBookings,
    createBooking,
    cancelBooking,
    getBookingById,
    fetchReceptionistStats,
    checkInPatient,
    completeBooking,
  };
}
