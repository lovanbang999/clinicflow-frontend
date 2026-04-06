'use client';

import { useState, useCallback } from 'react';
import { adminSchedulesApi } from '@/lib/api/admin/admin-schedules';
import {
  AdminScheduleStats,
  AdminScheduleSlot,
  AdminCreateScheduleDto,
  AdminUpdateScheduleDto,
  AdminScheduleFilters,
  AdminScheduleListResponse,
} from '@/types';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export const useAdminSchedules = () => {
  const [schedules, setSchedules] = useState<AdminScheduleSlot[]>([]);
  const [meta, setMeta] = useState<AdminScheduleListResponse['meta']>({
    total: 0,
  });
  
  const { execute, isLoading: loadingList } = useApiHandler();

  const [stats, setStats] = useState<AdminScheduleStats | null>(null);
  const { execute: executeStats, isLoading: loadingStats } = useApiHandler();

  const fetchSchedules = useCallback(async (filters: AdminScheduleFilters) => {
    const res = await execute(
      () => adminSchedulesApi.getSchedules(filters),
      { errorFallbackMsg: 'fetchSchedulesError' }
    );
    if (res) {
      setSchedules(res.data);
      setMeta(res.meta);
    }
  }, [execute]);

  const fetchStats = useCallback(async () => {
    const data = await executeStats(
      () => adminSchedulesApi.getStatistics(),
      { errorFallbackMsg: 'fetchScheduleStatsError' }
    );
    if (data) {
      setStats(data);
    }
  }, [executeStats]);

  const createSchedule = async (data: AdminCreateScheduleDto) => {
    return execute(
      () => adminSchedulesApi.createSchedule(data),
      {
        onSuccessMsg: 'createScheduleSuccess',
        errorFallbackMsg: 'createScheduleError'
      }
    );
  };

  const updateSchedule = async (id: string, data: AdminUpdateScheduleDto) => {
    return execute(
      () => adminSchedulesApi.updateSchedule(id, data),
      {
        onSuccessMsg: 'updateScheduleSuccess',
        errorFallbackMsg: 'updateScheduleError'
      }
    );
  };

  const deleteSchedule = async (id: string) => {
    await execute(
      () => adminSchedulesApi.deleteSchedule(id),
      {
        onSuccessMsg: 'deleteScheduleSuccess',
        errorFallbackMsg: 'deleteScheduleError'
      }
    );
  };

  const restoreSchedule = async (id: string) => {
    return execute(
      () => adminSchedulesApi.restoreSchedule(id),
      {
        onSuccessMsg: 'restoreScheduleSuccess',
        errorFallbackMsg: 'restoreScheduleError'
      }
    );
  };

  return {
    schedules,
    meta,
    loadingList,
    fetchSchedules,
    stats,
    loadingStats,
    fetchStats,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    restoreSchedule,
  };
};
