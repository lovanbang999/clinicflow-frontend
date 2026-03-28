'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  receptionistAnalyticsApi, 
  ReceptionistOverview, 
  RevenueTrendItem, 
  OperationalStats, 
  DateRange 
} from '@/lib/api/receptionist-analytics';
import { toast } from 'sonner';

export const useReceptionistOverview = (range?: DateRange) => {
  const [data, setData] = useState<ReceptionistOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await receptionistAnalyticsApi.getOverview(range);
      setData(result);
    } catch (err) {
      console.error('[useReceptionistOverview]', err);
      toast.error('Failed to load overview stats');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

export const useReceptionistRevenueTrend = (range?: DateRange) => {
  const [data, setData] = useState<RevenueTrendItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await receptionistAnalyticsApi.getRevenueTrend(range);
      setData(result);
    } catch (err) {
      console.error('[useReceptionistRevenueTrend]', err);
      toast.error('Failed to load revenue trend');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};

export const useReceptionistOperationalStats = (range?: DateRange) => {
  const [data, setData] = useState<OperationalStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const result = await receptionistAnalyticsApi.getOperationalStats(range);
      setData(result);
    } catch (err) {
      console.error('[useReceptionistOperationalStats]', err);
      toast.error('Failed to load operational stats');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, refetch: fetch };
};
