'use client';

import { useState, useCallback } from 'react';
import { schedulesApi, AffectedAppointment, PreviewOffDayResult } from '@/lib/api/schedules';
import { WorkingHours, OffDay, DayOfWeek } from '@/types';
import { toast } from 'sonner';

export const useDoctorSchedule = () => {
  // Working Hours
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  const fetchWorkingHours = useCallback(async (doctorId: string) => {
    try {
      setLoadingHours(true);
      const data = await schedulesApi.getWorkingHours(doctorId);
      setWorkingHours(data);
    } catch (err) {
      const error = err as Error;
      console.error('[useDoctorSchedule.fetchWorkingHours]', error);
      toast.error('Không thể tải lịch làm việc');
    } finally {
      setLoadingHours(false);
    }
  }, []);

  const saveWorkingHours = useCallback(
    async (doctorId: string, dayOfWeek: DayOfWeek, startTime: string, endTime: string) => {
      try {
        setSavingHours(true);
        const saved = await schedulesApi.saveWorkingHours({ doctorId, dayOfWeek, startTime, endTime });
        setWorkingHours((prev) => {
          const filtered = prev.filter((wh) => wh.dayOfWeek !== dayOfWeek);
          return [...filtered, saved];
        });
        toast.success('Đã lưu lịch làm việc');
        return saved;
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || 'Lưu lịch làm việc thất bại');
        throw error;
      } finally {
        setSavingHours(false);
      }
    },
    [],
  );

  const deleteWorkingHours = useCallback(async (doctorId: string, dayOfWeek: DayOfWeek) => {
    try {
      setSavingHours(true);
      await schedulesApi.deleteWorkingHours(doctorId, dayOfWeek);
      setWorkingHours((prev) => prev.filter((wh) => wh.dayOfWeek !== dayOfWeek));
      toast.success('Đã xóa lịch làm việc ngày ' + dayOfWeek);
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Xóa lịch làm việc thất bại');
      throw error;
    } finally {
      setSavingHours(false);
    }
  }, []);

  const bulkUpdateWorkingHours = useCallback(
    async (
      doctorId: string,
      items: { dayOfWeek: DayOfWeek; startTime: string; endTime: string; enabled: boolean }[],
    ) => {
      try {
        setSavingHours(true);
        const updated = await schedulesApi.bulkUpdateWorkingHours({ doctorId, items });
        setWorkingHours(updated);
        toast.success('Đã lưu tất cả thay đổi');
        return updated;
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || 'Lưu tất cả thay đổi thất bại');
        throw error;
      } finally {
        setSavingHours(false);
      }
    },
    [],
  );

  // Off Days
  const [offDays, setOffDays] = useState<OffDay[]>([]);
  const [loadingOffDays, setLoadingOffDays] = useState(false);
  const [savingOffDay, setSavingOffDay] = useState(false);

  // Pending confirmation state when affectedAppointments exist
  const [pendingOffDay, setPendingOffDay] = useState<{
    doctorId: string;
    date: string;
    reason: string;
    affectedAppointments: AffectedAppointment[];
  } | null>(null);

  const previewOffDay = useCallback(async (doctorId: string, date: string): Promise<PreviewOffDayResult> => {
    const result = await schedulesApi.previewOffDay(doctorId, date);
    return result;
  }, []);

  const fetchOffDays = useCallback(async (doctorId: string, startDate?: string, endDate?: string) => {
    try {
      setLoadingOffDays(true);
      const data = await schedulesApi.getOffDays(doctorId, startDate, endDate);
      setOffDays(data);
    } catch (err) {
      const error = err as Error;
      console.error('[useDoctorSchedule.fetchOffDays]', error);
      toast.error('Không thể tải danh sách nghỉ');
    } finally {
      setLoadingOffDays(false);
    }
  }, []);

  /**
   * Attempt to create an off day.
   * - If there are affected appointments, the result is stored in `pendingOffDay` for the UI to show a confirm dialog.
   * - If no affected appointments, the off day is considered immediately confirmed and added to state.
   * Returns { confirmed: true } if saved immediately, { confirmed: false, affectedAppointments } if needs dialog.
   */
  const requestOffDay = useCallback(
    async (doctorId: string, date: string, reason: string, cancelAffected = false) => {
      try {
        setSavingOffDay(true);
        const result = await schedulesApi.createOffDay({ doctorId, date, reason, cancelAffected });
        const { affectedAppointments, ...offDay } = result;

        // Always add to state – off day is created regardless
        setOffDays((prev) => [...prev, offDay]);

        if (cancelAffected && (result.cancelledCount ?? 0) > 0) {
          toast.success(`Đã đăng ký nghỉ và hủy ${result.cancelledCount} lịch hẹn.`);
        } else {
          toast.success('Đã đăng ký nghỉ thành công');
        }

        return { confirmed: true, affectedAppointments, cancelledCount: result.cancelledCount ?? 0 };
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || 'Đăng ký nghỉ thất bại');
        throw error;
      } finally {
        setSavingOffDay(false);
      }
    },
    [],
  );

  const clearPendingOffDay = useCallback(() => setPendingOffDay(null), []);

  const deleteOffDay = useCallback(async (doctorId: string, date: string) => {
    try {
      setSavingOffDay(true);
      await schedulesApi.deleteOffDay(doctorId, date);
      setOffDays((prev) => prev.filter((od) => od.date !== date));
      toast.success('Đã hủy đăng ký nghỉ');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Hủy nghỉ thất bại');
      throw error;
    } finally {
      setSavingOffDay(false);
    }
  }, []);

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
