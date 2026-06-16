'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, AdminDashboardOverview, RevenueChartItem, TopDoctorItem, TopServiceItem, DateRange, BookingOverview, RevenueReportData } from '@/lib/api/clinic/dashboard';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

// Hook: KPI Overview
export const useAdminStats = (range?: DateRange) => {
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getAdminStats(range),
      { errorFallbackMsg: 'fetchDashboardStatsError' }
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
        errorFallbackMsg: 'fetchRevenueChartError'
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
export const useAdminTopDoctors = (range?: DateRange, limit?: number) => {
  const [data, setData] = useState<TopDoctorItem[]>([]);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getAdminTopDoctors(range, limit),
      { errorFallbackMsg: 'fetchTopDoctorsError' }
    );
    if (result) setData(result);
  }, [range, limit, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Top Services
export const useAdminTopServices = (range?: DateRange, limit?: number) => {
  const [data, setData] = useState<TopServiceItem[]>([]);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getAdminTopServices(range, limit),
      { errorFallbackMsg: 'fetchTopServicesError' }
    );
    if (result) setData(result);
  }, [range, limit, execute]);

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
      { errorFallbackMsg: 'fetchBookingOverviewError' }
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

// Hook: Revenue Report
export const useAdminRevenueReport = (range?: DateRange) => {
  const [data, setData] = useState<RevenueReportData | null>(null);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => dashboardApi.getRevenueReport(range),
      { errorFallbackMsg: 'fetchRevenueReportError' }
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
