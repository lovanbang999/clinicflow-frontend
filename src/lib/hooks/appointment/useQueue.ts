'use client';

import { useState, useCallback, useEffect } from 'react';
import { QueueRecord, queueApi, QueueStats } from '@/lib/api/appointment/queue';
import { bookingsApi } from '@/lib/api/appointment/bookings';
import { useQueueSocket } from '@/lib/hooks/appointment/useQueueSocket';
import { format } from 'date-fns';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export function useQueue(doctorId?: string) {
  const [queueItems, setQueueItems] = useState<QueueRecord[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const { execute: executeFetch, isLoading, error: apiError } = useApiHandler();
  const { execute: executeAction } = useApiHandler();
  const [error, setError] = useState<string | null>(null);

  const { isConnected, onQueueUpdate } = useQueueSocket(doctorId);

  const fetchQueueData = useCallback(async () => {
    if (!doctorId) return;

    setError(null);
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const data = await executeFetch(
      async () => {
        const [queueRes, completedRes, statsRes] = await Promise.all([
          queueApi.getAll({ doctorId, date: today, limit: 50 }),
          bookingsApi.getAll({ doctorId, date: today, status: 'COMPLETED', limit: 100 }),
          queueApi.getStatistics(doctorId, today)
        ]);

        const activeQueue = queueRes.queueRecords || [];
        
        // Transform completed bookings into QueueRecord format for UI compatibility
        const completedQueue: QueueRecord[] = (completedRes.bookings || []).map(booking => ({
          id: `completed-${booking.id}`,
          bookingId: booking.id,
          doctorId: booking.doctorId,
          queueDate: today,
          queuePosition: 0,
          estimatedWaitMinutes: 0,
          isPreBooked: booking.startTime !== null,
          booking: booking
        }));

        // Merge avoiding duplicates
        const merged = [...activeQueue];
        completedQueue.forEach(item => {
          if (!merged.find(m => m.bookingId === item.bookingId)) {
            merged.push(item);
          }
        });

        return { items: merged, stats: statsRes };
      },
      { 
        errorFallbackMsg: 'fetchQueueDataError',
        onError: (err) => setError(err.message || 'Fetch error')
      }
    );

    if (data) {
      setQueueItems(data.items);
      setStats(data.stats);
    }
  }, [doctorId, executeFetch]);

  // Initial fetch and fetch when doctor changes
  useEffect(() => {
    if (doctorId) {
      const timer = setTimeout(() => {
        void fetchQueueData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [doctorId, fetchQueueData]);

  // WebSocket listener
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onQueueUpdate(() => {
      void fetchQueueData();
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected, onQueueUpdate, fetchQueueData]);

  const callPatient = useCallback(async (bookingId: string) => {
    await executeAction(
      () => bookingsApi.startExamination(bookingId),
      {
        onSuccessMsg: 'callPatientSuccess',
        errorFallbackMsg: 'callPatientError',
        onSuccess: () => fetchQueueData()
      }
    );
  }, [executeAction, fetchQueueData]);

  const completeVisit = useCallback(async (bookingId: string) => {
    await executeAction(
      () => bookingsApi.complete(bookingId),
      {
        onSuccessMsg: 'consultationCompleted',
        errorFallbackMsg: 'completeVisitError',
        onSuccess: () => fetchQueueData()
      }
    );
  }, [executeAction, fetchQueueData]);

  const markNoShow = useCallback(async (bookingId: string) => {
    await executeAction(
      () => bookingsApi.markNoShow(bookingId),
      {
        onSuccessMsg: 'markNoShowSuccess',
        errorFallbackMsg: 'markNoShowError',
        onSuccess: () => fetchQueueData()
      }
    );
  }, [executeAction, fetchQueueData]);

  return {
    queueItems,
    stats,
    isLoading,
    error: error || (apiError ? (apiError.message || 'Error') : null),
    isConnected,
    fetchQueueData,
    callPatient,
    completeVisit,
    markNoShow
  };
}
