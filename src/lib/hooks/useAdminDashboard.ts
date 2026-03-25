'use client';

import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, AdminStatsResponse, RevenueChartItem, TopDoctorItem, TopServiceItem } from '@/lib/api/dashboard';
import { toast } from 'sonner';

// Hook: KPI Overview
export const useAdminStats = () => {
  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminStats();
      setData(result);
    } catch (err) {
      console.error('[useAdminStats]', err);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Revenue Chart
export const useAdminRevenueChart = (period: 'week' | 'month' | 'quarter' = 'month') => {
  const [data, setData] = useState<RevenueChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminRevenueChart(period);
      setData(result);
    } catch (err) {
      console.error('[useAdminRevenueChart]', err);
      toast.error('Failed to load revenue chart');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Top Doctors
export const useAdminTopDoctors = () => {
  const [data, setData] = useState<TopDoctorItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminTopDoctors();
      setData(result);
    } catch (err) {
      console.error('[useAdminTopDoctors]', err);
      toast.error('Failed to load top doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

// Hook: Top Services
export const useAdminTopServices = () => {
  const [data, setData] = useState<TopServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAdminTopServices();
      setData(result);
    } catch (err) {
      console.error('[useAdminTopServices]', err);
      toast.error('Failed to load top services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};
