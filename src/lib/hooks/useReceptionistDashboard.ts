'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { bookingsApi, ReceptionistStatsResponse } from '@/lib/api/bookings';
import { queueApi, QueueRecord } from '@/lib/api/queue';
import { Booking, BookingStatus } from '@/types';

export const useReceptionistDashboard = () => {
  // Stats
  const [stats, setStats] = useState<ReceptionistStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Upcoming Bookings (Today's Confirmed)
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  // Live Queue
  const [queueRecords, setQueueRecords] = useState<QueueRecord[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Search & Check-in
  const [searchResults, setSearchResults] = useState<Booking[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  /**
   * Fetch today's summary stats
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await bookingsApi.getReceptionistStats();
      setStats(data);
    } catch (err) {
      console.error('[useReceptionistDashboard.fetchStats] error:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Fetch today's confirmed bookings that are NOT yet checked-in
   */
  const fetchUpcoming = useCallback(async () => {
    try {
      setLoadingUpcoming(true);
      const today = new Date().toISOString().split('T')[0];
      const res = await bookingsApi.getAll({
        date: today,
        status: BookingStatus.CONFIRMED,
        limit: 50,
      });
      setUpcomingBookings(res.bookings);
    } catch (err) {
      console.error('[useReceptionistDashboard.fetchUpcoming] error:', err);
    } finally {
      setLoadingUpcoming(false);
    }
  }, []);

  /**
   * Fetch all patients currently in the queue
   */
  const fetchQueue = useCallback(async () => {
    try {
      setLoadingQueue(true);
      const res = await queueApi.getAll({
        limit: 100,
      });
      setQueueRecords(res.queueRecords);
    } catch (err) {
      console.error('[useReceptionistDashboard.fetchQueue] error:', err);
    } finally {
      setLoadingQueue(false);
    }
  }, []);

  /**
   * Search for confirmed bookings to check-in
   */
  const searchBookings = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setLoadingSearch(true);
      const res = await bookingsApi.getAll({
        search: query,
        status: BookingStatus.CONFIRMED, // Only confirmed bookings can be checked in
        limit: 10,
      });
      setSearchResults(res.bookings);
    } catch (err) {
      console.error('[useReceptionistDashboard.searchBookings] error:', err);
    } finally {
      setLoadingSearch(false);
    }
  }, []);

  /**
   * Perform check-in for a booking
   */
  const checkIn = useCallback(async (bookingId: string) => {
    try {
      setIsCheckingIn(true);
      const res = await bookingsApi.checkIn(bookingId);
      toast.success(`Check-in thành công! Số thứ tự: ${res.queue.queuePosition}`);
      
      // Refresh data
      fetchStats();
      fetchUpcoming();
      fetchQueue();
      setSearchResults(prev => prev.filter(b => b.id !== bookingId));
      
      return res;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Check-in thất bại');
      throw error;
    } finally {
      setIsCheckingIn(false);
    }
  }, [fetchStats, fetchUpcoming, fetchQueue]);

  /**
   * Manually promote a booking in the queue
   */
  const promoteQueue = useCallback(async (bookingId: string, reason?: string) => {
    try {
      await queueApi.promote(bookingId, reason);
      toast.success('Đã ưu tiên bệnh nhân trong hàng đợi');
      fetchQueue();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Không thể ưu tiên bệnh nhân');
    }
  }, [fetchQueue]);

  const refreshAll = useCallback(() => {
    fetchStats();
    fetchUpcoming();
    fetchQueue();
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
