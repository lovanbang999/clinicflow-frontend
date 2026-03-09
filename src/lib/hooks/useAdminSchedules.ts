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
import { toast } from 'sonner';

export const useAdminSchedules = () => {
  const [schedules, setSchedules] = useState<AdminScheduleSlot[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [meta, setMeta] = useState<AdminScheduleListResponse['meta']>({
    total: 0,
  });

  const [stats, setStats] = useState<AdminScheduleStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const fetchSchedules = useCallback(async (filters: AdminScheduleFilters) => {
    try {
      setLoadingList(true);
      const res = await adminSchedulesApi.getSchedules(filters);
      setSchedules(res.data);
      setMeta(res.meta);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminSchedules.fetchSchedules] error:', error);
      toast.error(error.message || 'Failed to fetch schedules');
    } finally {
      setLoadingList(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await adminSchedulesApi.getStatistics();
      setStats(data);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminSchedules.fetchStats] error:', error);
      toast.error(error.message || 'Failed to fetch schedule statistics');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const createSchedule = async (data: AdminCreateScheduleDto) => {
    try {
      const newSchedule = await adminSchedulesApi.createSchedule(data);
      toast.success('Schedule created successfully');
      return newSchedule;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create schedule');
      throw error;
    }
  };

  const updateSchedule = async (id: string, data: AdminUpdateScheduleDto) => {
    try {
      const updatedSchedule = await adminSchedulesApi.updateSchedule(id, data);
      toast.success('Schedule updated successfully');
      return updatedSchedule;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update schedule');
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await adminSchedulesApi.deleteSchedule(id);
      toast.success('Schedule deleted successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete schedule');
      throw error;
    }
  };

  const restoreSchedule = async (id: string) => {
    try {
      const restored = await adminSchedulesApi.restoreSchedule(id);
      toast.success('Schedule restored successfully');
      return restored;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to restore schedule');
      throw error;
    }
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
