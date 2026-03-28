'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, AdminDashboardOverview, RevenueChartItem, TopDoctorItem, TopServiceItem, DateRange, BookingOverview } from '@/lib/api/dashboard';
import { toast } from 'sonner';

// Hook: KPI Overview
export const useAdminStats = (range?: DateRange) => {
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminStats(range);
      setData(result);
    } catch (err) {
      console.error('[useAdminStats]', err);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Revenue Chart
export const useAdminRevenueChart = (period: 'week' | 'month' | 'quarter' = 'month', range?: DateRange, enabled = true) => {
  const [data, setData] = useState<RevenueChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminRevenueChart(period, range);
      setData(result);
    } catch (err) {
      console.error('[useAdminRevenueChart]', err);
      // Only toast error if enabled
      if (enabled) toast.error('Failed to load revenue chart');
    } finally {
      setLoading(false);
    }
  }, [period, range, enabled]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Top Doctors
export const useAdminTopDoctors = (range?: DateRange) => {
  const [data, setData] = useState<TopDoctorItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminTopDoctors(range);
      setData(result);
    } catch (err) {
      console.error('[useAdminTopDoctors]', err);
      toast.error('Failed to load top doctors');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Top Services
export const useAdminTopServices = (range?: DateRange) => {
  const [data, setData] = useState<TopServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminTopServices(range);
      setData(result);
    } catch (err) {
      console.error('[useAdminTopServices]', err);
      toast.error('Failed to load top services');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Booking Overview
export const useAdminBookingOverview = (range?: DateRange) => {
  const [data, setData] = useState<BookingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getBookingOverview(range);
      setData(result);
    } catch (err) {
      console.error('[useAdminBookingOverview]', err);
      toast.error('Failed to load booking overview');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};
