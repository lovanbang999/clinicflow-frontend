'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '@/lib/api/dashboard';
import {
  AdminDashboardStats,
  MonthlyStats,
  TopDoctor,
  RevenueChartData,
  BookingOverviewData,
} from '@/types/dashboard';
import { toast } from 'sonner';

// Hook: KPI Overview (4 top cards)
export const useAdminOverview = () => {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getAdminOverview();
      setData(result);
    } catch (err) {
      const e = err as Error;
      setError(e);
      console.error('[useAdminOverview] error:', e);
      toast.error('Failed to load overview stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
};

// Hook: Monthly Stats panel
export const useAdminMonthlyStats = (month?: string) => {
  const [data, setData] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getAdminMonthlyStats(month);
      setData(result);
    } catch (err) {
      const e = err as Error;
      setError(e);
      console.error('[useAdminMonthlyStats] error:', e);
      toast.error('Failed to load monthly stats');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
};

// Hook: Top Doctors panel
export const useAdminTopDoctors = (limit: number = 5) => {
  const [data, setData] = useState<TopDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getAdminTopDoctors(limit);
      setData(result);
    } catch (err) {
      const e = err as Error;
      setError(e);
      console.error('[useAdminTopDoctors] error:', e);
      toast.error('Failed to load top doctors');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
};

// Hook: Revenue Chart (AreaChart)
export const useAdminRevenueChart = (months: number = 6) => {
  const [data, setData] = useState<RevenueChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getAdminRevenueChart(months);
      setData(result);
    } catch (err) {
      const e = err as Error;
      setError(e);
      console.error('[useAdminRevenueChart] error:', e);
      toast.error('Failed to load revenue chart');
    } finally {
      setLoading(false);
    }
  }, [months]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
};

// Hook: Booking Overview (status breakdown)
export const useAdminBookingOverview = () => {
  const [data, setData] = useState<BookingOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardApi.getAdminBookingOverview();
      setData(result);
    } catch (err) {
      const e = err as Error;
      setError(e);
      console.error('[useAdminBookingOverview] error:', e);
      toast.error('Failed to load booking overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
};
