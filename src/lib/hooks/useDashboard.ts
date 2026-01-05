'use client';

import { useState, useEffect } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import { DashboardData } from '@/types';
import { toast } from 'sonner';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const dashboardData = await dashboardApi.getPatientStats();
        setData(dashboardData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard';
        setError(errorMessage);
        toast.error('Lỗi', {
          description: 'Không thể tải thông tin dashboard',
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  return { data, isLoading, error };
}
