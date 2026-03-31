'use client';

import { useState, useCallback } from 'react';
import { adminSchedulesApi } from '@/lib/api/admin-schedules';
import {
  AdminScheduleStats,
  AdminScheduleSlot,
  AdminCreateScheduleDto,
  AdminUpdateScheduleDto,
  AdminScheduleFilters,
  AdminScheduleListResponse,
} from '@/types';
import { useApiHandler } from './useApiHandler';

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
      { errorFallbackMsg: 'Failed to fetch schedules' }
    );
    if (res) {
      setSchedules(res.data);
      setMeta(res.meta);
    }
  }, [execute]);

  const fetchStats = useCallback(async () => {
    const data = await executeStats(
      () => adminSchedulesApi.getStatistics(),
      { errorFallbackMsg: 'Failed to fetch schedule statistics' }
    );
    if (data) {
      setStats(data);
    }
  }, [executeStats]);

  const createSchedule = async (data: AdminCreateScheduleDto) => {
    return execute(
      () => adminSchedulesApi.createSchedule(data),
      {
        onSuccessMsg: 'Schedule created successfully',
        errorFallbackMsg: 'Failed to create schedule'
      }
    );
  };

  const updateSchedule = async (id: string, data: AdminUpdateScheduleDto) => {
    return execute(
      () => adminSchedulesApi.updateSchedule(id, data),
      {
        onSuccessMsg: 'Schedule updated successfully',
        errorFallbackMsg: 'Failed to update schedule'
      }
    );
  };

  const deleteSchedule = async (id: string) => {
    await execute(
      () => adminSchedulesApi.deleteSchedule(id),
      {
        onSuccessMsg: 'Schedule deleted successfully',
        errorFallbackMsg: 'Failed to delete schedule'
      }
    );
  };

  const restoreSchedule = async (id: string) => {
    return execute(
      () => adminSchedulesApi.restoreSchedule(id),
      {
        onSuccessMsg: 'Schedule restored successfully',
        errorFallbackMsg: 'Failed to restore schedule'
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
