'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  receptionistAnalyticsApi, 
  ReceptionistOverview, 
  RevenueTrendItem, 
  OperationalStats, 
  DateRange 
} from '@/lib/api/receptionist-analytics';
import { useApiHandler } from './useApiHandler';

export const useReceptionistOverview = (range?: DateRange) => {
  const [data, setData] = useState<ReceptionistOverview | null>(null);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => receptionistAnalyticsApi.getOverview(range),
      { errorFallbackMsg: 'fetchOverviewStatsError' }
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

export const useReceptionistRevenueTrend = (range?: DateRange) => {
  const [data, setData] = useState<RevenueTrendItem[]>([]);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => receptionistAnalyticsApi.getRevenueTrend(range),
      { errorFallbackMsg: 'fetchRevenueTrendError' }
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

export const useReceptionistOperationalStats = (range?: DateRange) => {
  const [data, setData] = useState<OperationalStats | null>(null);
  const { execute, isLoading: loading } = useApiHandler();

  const fetch = useCallback(async () => {
    const result = await execute(
      () => receptionistAnalyticsApi.getOperationalStats(range),
      { errorFallbackMsg: 'fetchOpStatsError' }
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
