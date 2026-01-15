import { useState, useCallback } from 'react';
import { bookingsApi } from '@/lib/api/bookings';
import { CreateBookingDto, Booking, BookingStatus } from '@/types';
import { toast } from 'sonner';

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch my bookings
  const fetchMyBookings = useCallback(async (): Promise<Booking[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingsApi.getMyBookings();
      setBookings(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      const errorMessage = error && 'response' in error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (error as any).response?.data?.message
        : 'Failed to load appointments';
      
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all bookings with filters
  const fetchBookings = useCallback(async (params?: {
    status?: BookingStatus;
    doctorId?: string;
    patientId?: string;
    date?: string;
  }): Promise<Booking[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bookingsApi.getAll(params);
      setBookings(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      const errorMessage = error && 'response' in error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (error as any).response?.data?.message
        : 'Failed to load bookings';
      
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create booking
  const createBooking = useCallback(async (data: CreateBookingDto): Promise<Booking | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const booking = await bookingsApi.create(data);
      toast.success('Booking created successfully');
      return booking;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      const errorMessage = error && 'response' in error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (error as any).response?.data?.message
        : 'Đặt lịch thất bại. Vui lòng thử lại.';
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cancel booking
  const cancelBooking = useCallback(async (id: string, reason?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      await bookingsApi.cancel(id, reason);
      toast.success('Appointment cancelled successfully');
      return true;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      const errorMessage = error && 'response' in error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (error as any).response?.data?.message
        : 'Failed to cancel appointment';
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get booking by ID
  const getBookingById = useCallback(async (id: string): Promise<Booking | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const booking = await bookingsApi.getById(id);
      return booking;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      const errorMessage = error && 'response' in error
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? (error as any).response?.data?.message
        : 'Failed to load booking details';
      
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    bookings,
    isLoading,
    error,
    fetchMyBookings,
    fetchBookings,
    createBooking,
    cancelBooking,
    getBookingById,
  };
}