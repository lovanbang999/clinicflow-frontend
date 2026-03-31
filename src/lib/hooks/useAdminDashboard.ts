'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, AdminDashboardOverview, RevenueChartItem, TopDoctorItem, TopServiceItem, DateRange, BookingOverview } from '@/lib/api/dashboard';
import { useApiHandler } from './useApiHandler';

// Hook: KPI Overview
export const useAdminStats = (range?: DateRange) => {
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getAdminStats(range),
      { errorFallbackMsg: 'Failed to load dashboard stats' }
    );
    if (result) setData(result);
  }, [range, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Revenue Chart
export const useAdminRevenueChart = (period: 'week' | 'month' | 'quarter' = 'month', range?: DateRange, enabled = true) => {
  const [data, setData] = useState<RevenueChartItem[]>([]);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    if (!enabled) return;
    
    const result = await execute(
      () => dashboardApi.getAdminRevenueChart(period, range),
      { 
        showErrorToast: enabled,
        errorFallbackMsg: 'Failed to load revenue chart'
      }
    );
    if (result) setData(result);
  }, [period, range, enabled, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Top Doctors
export const useAdminTopDoctors = (range?: DateRange) => {
  const [data, setData] = useState<TopDoctorItem[]>([]);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getAdminTopDoctors(range),
      { errorFallbackMsg: 'Failed to load top doctors' }
    );
    if (result) setData(result);
  }, [range, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Top Services
export const useAdminTopServices = (range?: DateRange) => {
  const [data, setData] = useState<TopServiceItem[]>([]);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getAdminTopServices(range),
      { errorFallbackMsg: 'Failed to load top services' }
    );
    if (result) setData(result);
  }, [range, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Booking Overview
export const useAdminBookingOverview = (range?: DateRange) => {
  const [data, setData] = useState<BookingOverview | null>(null);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getBookingOverview(range),
      { errorFallbackMsg: 'Failed to load booking overview' }
    );
    if (result) setData(result);
  }, [range, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetch]);
  return { data, loading, refetch: fetch };
};
