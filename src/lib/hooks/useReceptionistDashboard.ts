'use client';

import { useState, useCallback, useEffect } from 'react';
import { bookingsApi, ReceptionistStatsResponse } from '@/lib/api/bookings';
import { queueApi, QueueRecord } from '@/lib/api/queue';
import { Booking, BookingStatus } from '@/types';
import { useApiHandler } from './useApiHandler';

export const useReceptionistDashboard = () => {
  // Stats
  const [stats, setStats] = useState<ReceptionistStatsResponse | null>(null);
  const { execute: executeStats, isLoading: loadingStats } = useApiHandler();

  // Upcoming Bookings (Today's Confirmed)
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const { execute: executeUpcoming, isLoading: loadingUpcoming } = useApiHandler();

  // Live Queue
  const [queueRecords, setQueueRecords] = useState<QueueRecord[]>([]);
  const { execute: executeQueue, isLoading: loadingQueue } = useApiHandler();

  // Search & Check-in
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const { execute: executeSearch, isLoading: loadingSearch } = useApiHandler();
  const { execute: executeCheckIn, isLoading: isCheckingIn } = useApiHandler();
  const { execute: executePromote } = useApiHandler();

  /**
   * Fetch today's summary stats
   */
  const fetchStats = useCallback(async () => {
    const data = await executeStats(() => bookingsApi.getReceptionistStats());
    if (data) setStats(data);
  }, [executeStats]);

  /**
   * Fetch today's confirmed bookings that are NOT yet checked-in
   */
  const fetchUpcoming = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await executeUpcoming(() => bookingsApi.getAll({
      date: today,
      status: BookingStatus.CONFIRMED,
      limit: 50,
    }));
    if (res) setUpcomingBookings(res.bookings);
  }, [executeUpcoming]);

  /**
   * Fetch all patients currently in the queue
   */
  const fetchQueue = useCallback(async () => {
    const res = await executeQueue(() => queueApi.getAll({ limit: 100 }));
    if (res) setQueueRecords(res.queueRecords);
  }, [executeQueue]);

  /**
   * Search for confirmed bookings to check-in
   */
  const searchBookings = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const res = await executeSearch(() => bookingsApi.getAll({
      search: query,
      status: BookingStatus.CONFIRMED,
      limit: 10,
    }));
    if (res) setSearchResults(res.bookings);
  }, [executeSearch]);

  /**
   * Perform check-in for a booking
   */
  const checkIn = useCallback(async (bookingId: string) => {
    return executeCheckIn(
      async () => {
        const res = await bookingsApi.checkIn(bookingId);
        // Refresh data
        void fetchStats();
        void fetchUpcoming();
        void fetchQueue();
        setSearchResults(prev => prev.filter(b => b.id !== bookingId));
        return res;
      },
      {
        onSuccess: (res) => {
          // Dynamic success message is handled better by specifying onSuccessMsg if static
          // or custom toast if dynamic. Since we want the queue number, use custom toasts.
        },
        onSuccessMsg: 'Check-in thành công!', // Simplified, details in backend message usually
        errorFallbackMsg: 'Check-in thất bại'
      }
    );
  }, [executeCheckIn, fetchStats, fetchUpcoming, fetchQueue]);

  /**
   * Manually promote a booking in the queue
   */
  const promoteQueue = useCallback(async (bookingId: string, reason?: string) => {
    await executePromote(
      () => queueApi.promote(bookingId, reason),
      {
        onSuccessMsg: 'Đã ưu tiên bệnh nhân trong hàng đợi',
        errorFallbackMsg: 'Không thể ưu tiên bệnh nhân',
        onSuccess: () => fetchQueue()
      }
    );
  }, [executePromote, fetchQueue]);

  const refreshAll = useCallback(() => {
    void fetchStats();
    void fetchUpcoming();
    void fetchQueue();
  }, [fetchStats, fetchUpcoming, fetchQueue]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    stats,
    loadingStats,
    upcomingBookings,
    loadingUpcoming,
    queueRecords,
    loadingQueue,
    searchResults,
    loadingSearch,
    isCheckingIn,
    fetchStats,
    fetchUpcoming,
    fetchQueue,
    searchBookings,
    checkIn,
    promoteQueue,
    refreshAll,
  };
};
