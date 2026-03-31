'use client';

import { useState, useEffect } from 'react';
import { bookingsApi } from '@/lib/api/bookings';
import { DashboardData } from '@/types';
import { useApiHandler } from './useApiHandler';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const { execute, isLoading, error } = useApiHandler();

  useEffect(() => {
    const fetchDashboard = async () => {
      await execute(
        async () => {
          const dashboardData = await bookingsApi.getPatientDashboardStats();
          setData(dashboardData);
        },
        { errorFallbackMsg: 'fetchDashboardInfoError' }
      );
    };

    const timer = setTimeout(() => {
      void fetchDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [execute]);

  return { data, isLoading, error };
}
