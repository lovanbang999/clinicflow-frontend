'use client';

import { useState, useCallback } from 'react';
import { schedulesApi, AffectedAppointment, PreviewOffDayResult } from '@/lib/api/appointment/schedules';
import { WorkingHours, OffDay, DayOfWeek } from '@/types';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export const useDoctorSchedule = () => {
  // Working Hours
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const { execute: executeHours, isLoading: loadingHours } = useApiHandler();
  const { execute: executeSaveHours, isLoading: savingHours } = useApiHandler();

  const fetchWorkingHours = useCallback(async (doctorId: string) => {
    const data = await executeHours(
      () => schedulesApi.getWorkingHours(doctorId),
      { errorFallbackMsg: 'fetchScheduleWorkError' }
    );
    if (data) setWorkingHours(data);
  }, [executeHours]);

  const saveWorkingHours = useCallback(
    async (
      doctorId: string,
      dayOfWeek: DayOfWeek,
      startTime: string,
      endTime: string,
      breakStartTime?: string | null,
      breakEndTime?: string | null,
    ) => {
      return executeSaveHours(
        async () => {
          const saved = await schedulesApi.saveWorkingHours({
            doctorId,
            dayOfWeek,
            startTime,
            endTime,
            breakStartTime,
            breakEndTime,
          });
          setWorkingHours((prev) => {
            const filtered = prev.filter((wh) => wh.dayOfWeek !== dayOfWeek);
            return [...filtered, saved];
          });
          return saved;
        },
        {
          onSuccessMsg: 'saveScheduleSuccess',
          errorFallbackMsg: 'saveScheduleWorkError'
        }
      );
    },
    [executeSaveHours],
  );

  const deleteWorkingHours = useCallback(async (doctorId: string, dayOfWeek: DayOfWeek) => {
    await executeSaveHours(
      async () => {
        await schedulesApi.deleteWorkingHours(doctorId, dayOfWeek);
        setWorkingHours((prev) => prev.filter((wh) => wh.dayOfWeek !== dayOfWeek));
      },
      {
        onSuccessMsg: 'Đã xóa lịch làm việc ngày ' + dayOfWeek,
        errorFallbackMsg: 'deleteScheduleWorkError'
      }
    );
  }, [executeSaveHours]);

  const bulkUpdateWorkingHours = useCallback(
    async (
      doctorId: string,
      items: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        enabled: boolean;
        breakStartTime?: string | null;
        breakEndTime?: string | null;
      }[],
    ) => {
      return executeSaveHours(
        async () => {
          const updated = await schedulesApi.bulkUpdateWorkingHours({ doctorId, items });
          setWorkingHours(updated);
          return updated;
        },
        {
          onSuccessMsg: 'saveAllChangesSuccess',
          errorFallbackMsg: 'saveAllChangesError'
        }
      );
    },
    [executeSaveHours],
  );

  // Off Days
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const { execute: executeOffDays, isLoading: loadingOffDays } = useApiHandler();
  const { execute: executeSaveOffDay, isLoading: savingOffDay } = useApiHandler();

  // Pending confirmation state when affectedAppointments exist
  const [pendingOffDay, setPendingOffDay] = useState<{
    doctorId: string;
    date: string;
    reason: string;
    affectedAppointments: AffectedAppointment[];
  } | null>(null);

  const previewOffDay = useCallback(async (doctorId: string, date: string): Promise<PreviewOffDayResult | undefined> => {
    return executeOffDays(() => schedulesApi.previewOffDay(doctorId, date));
  }, [executeOffDays]);

  const fetchOffDays = useCallback(async (doctorId: string, startDate?: string, endDate?: string) => {
    const data = await executeOffDays(
      () => schedulesApi.getOffDays(doctorId, startDate, endDate),
      { errorFallbackMsg: 'fetchLeaveListError' }
    );
    if (data) setOffDays(data);
  }, [executeOffDays]);

  /**
   * Attempt to create an off day.
   */
  const requestOffDay = useCallback(
    async (doctorId: string, date: string, reason: string, cancelAffected = false) => {
      return executeSaveOffDay(
        async () => {
          const result = await schedulesApi.createOffDay({ doctorId, date, reason, cancelAffected });
          const { affectedAppointments, ...offDay } = result;

          // Always add to state – off day is created regardless
          setOffDays((prev) => [...prev, offDay]);

          return { confirmed: true, affectedAppointments, cancelledCount: result.cancelledCount ?? 0 };
        },
        {
          onSuccess: (res) => {
            if (cancelAffected && (res?.cancelledCount ?? 0) > 0) {
              // Note: Toast handled by onSuccessMsg if provided, but here we want dynamic msg
            }
          },
          onSuccessMsg: 'registerLeaveSuccess',
          errorFallbackMsg: 'registerLeaveError'
        }
      );
    },
    [executeSaveOffDay],
  );

  const clearPendingOffDay = useCallback(() => setPendingOffDay(null), []);

  const deleteOffDay = useCallback(async (doctorId: string, date: string) => {
    await executeSaveOffDay(
      async () => {
        await schedulesApi.deleteOffDay(doctorId, date);
        setOffDays((prev) => prev.filter((od) => od.date !== date));
      },
      {
        onSuccessMsg: 'cancelLeaveSuccess',
        errorFallbackMsg: 'cancelLeaveError'
      }
    );
  }, [executeSaveOffDay]);

  return {
    // Working hours
    workingHours,
    loadingHours,
    savingHours,
    fetchWorkingHours,
    saveWorkingHours,
    deleteWorkingHours,
    bulkUpdateWorkingHours,
    // Off days
    offDays,
    loadingOffDays,
    savingOffDay,
    pendingOffDay,
    clearPendingOffDay,
    fetchOffDays,
    previewOffDay,
    requestOffDay,
    deleteOffDay,
  };
};
