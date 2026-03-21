'use client';

import { useState, useCallback, useEffect } from 'react';
import { QueueRecord, queueApi, QueueStats } from '@/lib/api/queue';
import { bookingsApi } from '@/lib/api/bookings';
import { useQueueSocket } from './useQueueSocket';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function useQueue(doctorId?: string) {
  const [queueItems, setQueueItems] = useState<QueueRecord[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, onQueueUpdate } = useQueueSocket(doctorId);

  const fetchQueueData = useCallback(async () => {
    if (!doctorId) return;

    try {
      setIsLoading(true);
      setError(null);
      const today = format(new Date(), 'yyyy-MM-dd');
      
      const [queueRes, statsRes] = await Promise.all([
        queueApi.getAll({ doctorId, date: today, limit: 50 }),
        queueApi.getStatistics(doctorId, today)
      ]);

      setQueueItems(queueRes.queueRecords || []);
      setStats(statsRes);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch queue data';
      setError(msg);
      console.error('Queue fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  // Initial fetch and fetch when doctor changes
  useEffect(() => {
    if (doctorId) {
      void fetchQueueData();
    }
  }, [doctorId, fetchQueueData]);

  // WebSocket listener
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onQueueUpdate(() => {
      // Re-fetch everything on any update
      void fetchQueueData();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected, onQueueUpdate, fetchQueueData]);

  const callPatient = useCallback(async (bookingId: string) => {
    try {
      await bookingsApi.startExamination(bookingId);
      toast.success('Patient called successfully');
      void fetchQueueData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to call patient';
      toast.error('Error', { description: msg });
    }
  }, [fetchQueueData]);

  const completeVisit = useCallback(async (bookingId: string) => {
    try {
      await bookingsApi.complete(bookingId);
      toast.success('Consultation completed');
      void fetchQueueData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to complete visit';
      toast.error('Error', { description: msg });
    }
  }, [fetchQueueData]);

  const markNoShow = useCallback(async (bookingId: string) => {
    try {
      await bookingsApi.markNoShow(bookingId);
      toast.success('Marked as no-show');
      void fetchQueueData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to mark no-show';
      toast.error('Error', { description: msg });
    }
  }, [fetchQueueData]);

  return {
    queueItems,
    stats,
    isLoading,
    error,
    isConnected,
    fetchQueueData,
    callPatient,
    completeVisit,
    markNoShow
  };
}
