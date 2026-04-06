import { useState, useCallback } from 'react';
import { bookingsApi, ReceptionistStatsResponse } from '../api/bookings';
import { CreateBookingDto, Booking, BookingStatus } from '@/types';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

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
      { errorFallbackMsg: 'fetchAppointmentsError' }
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
      { errorFallbackMsg: 'fetchBookingsError' }
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
        onSuccessMsg: 'createBookingSuccess',
        errorFallbackMsg: 'createBookingError' 
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
        onSuccessMsg: 'cancelAppointmentSuccess',
        errorFallbackMsg: 'cancelAppointmentError',
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
      { errorFallbackMsg: 'fetchBookingDetailsError' }
    ).then(res => res || null);
  }, [execute]);

  // Fetch receptionist check-in stats
  const fetchReceptionistStats = useCallback(async (): Promise<ReceptionistStatsResponse | null> => {
    return execute(
      async () => {
        return await bookingsApi.getReceptionistStats();
      },
      { errorFallbackMsg: 'fetchBookingStatsError' }
    ).then(res => res || null);
  }, [execute]);

  // Check-in patient
  const checkInPatient = useCallback(async (id: string) => {
    return execute(
      async () => {
        const data = await bookingsApi.checkIn(id);
        return data;
      },
      { errorFallbackMsg: 'checkInPatientError' }
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
        errorFallbackMsg: 'completeVisitError',
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
