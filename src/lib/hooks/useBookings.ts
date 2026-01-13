import { useState } from 'react';
import { bookingsApi } from '@/lib/api/bookings';
import { CreateBookingDto, Booking } from '@/types';
import { toast } from 'sonner';

export function useBookings() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createBooking = async (data: CreateBookingDto): Promise<Booking | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const booking = await bookingsApi.create(data);
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
  };

  return {
    createBooking,
    isLoading,
    error,
  };
}