'use client';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  startOfWeek, endOfWeek, startOfDay, endOfDay,
  eachDayOfInterval, format, addWeeks, subWeeks, addDays, subDays, isToday,
} from 'date-fns';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { vi } from 'date-fns/locale';
import { AdminScheduleSlot } from '@/types';
import { useAdminSchedules } from '@/lib/hooks/useAdminSchedules';
import { AddSlotDialog } from './AddSlotDialog';
import { EditSlotDialog } from './EditSlotDialog';
import { ScheduleToolbar } from './ScheduleToolbar';
import { ScheduleWeekTable } from './ScheduleWeekTable';
import { ScheduleDayGantt } from './ScheduleDayGantt';

type ViewMode = 'week' | 'day';

export function MasterSchedule() {
  const tMs = useTranslations('dashboard.scheduleManagement.masterSchedule');

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDoctorId, setFilterDoctorId] = useState('all');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<AdminScheduleSlot | null>(null);
  const [deleteSlot, setDeleteSlot] = useState<AdminScheduleSlot | null>(null);

  const { schedules, loadingList, fetchSchedules, deleteSchedule, restoreSchedule } = useAdminSchedules();

  // Data loading
  const loadSchedules = useCallback(() => {
    const startDate = viewMode === 'day'
      ? startOfDay(currentDate).toISOString()
      : startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
    const endDate = viewMode === 'day'
      ? endOfDay(currentDate).toISOString()
      : endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();

    fetchSchedules({
      startDate,
      endDate,
      doctorId: filterDoctorId !== 'all' ? filterDoctorId : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
    });
  }, [currentDate, viewMode, filterStatus, filterDoctorId, fetchSchedules]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  // Navigation
  const goBack = () => setCurrentDate(viewMode === 'day' ? subDays(currentDate, 1) : subWeeks(currentDate, 1));
  const goNext = () => setCurrentDate(viewMode === 'day' ? addDays(currentDate, 1) : addWeeks(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());

  const weekDays = useMemo(() =>
    eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    }),
    [currentDate],
  );

  const isTodayPeriod = viewMode === 'day'
    ? isToday(currentDate)
    : weekDays.some((d) => isToday(d));

  const dateLabel = viewMode === 'day'
    ? format(currentDate, 'EEEE, dd MMM yyyy', { locale: vi })
    : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM', { locale: vi })} — ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: vi })}`;

  // Derived data
  const doctors = useMemo(() => {
    const map = new Map<string, AdminScheduleSlot['doctor']>();
    schedules.forEach((s) => { if (s.doctor && !map.has(s.doctor.id)) map.set(s.doctor.id, s.doctor); });
    return Array.from(map.values());
  }, [schedules]);

  const filteredSchedules = useMemo(() =>
    filterDoctorId === 'all' ? schedules : schedules.filter((s) => s.doctorId === filterDoctorId),
    [schedules, filterDoctorId],
  );

  const visibleDoctors = useMemo(() => {
    const map = new Map<string, AdminScheduleSlot['doctor']>();
    filteredSchedules.forEach((s) => { if (s.doctor && !map.has(s.doctor.id)) map.set(s.doctor.id, s.doctor); });
    return Array.from(map.values());
  }, [filteredSchedules]);

  // Actions
  const handleDelete = async () => {
    if (!deleteSlot) return;
    await deleteSchedule(deleteSlot.id);
    setDeleteSlot(null);
    loadSchedules();
  };

  const handleRestore = async (slot: AdminScheduleSlot) => {
    await restoreSchedule(slot.id);
    loadSchedules();
  };

  // Render
  return (
    <>
      <Card className="rounded-2xl border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col p-0 gap-0">
        <ScheduleToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          dateLabel={dateLabel}
          isTodayPeriod={isTodayPeriod}
          filterStatus={filterStatus}
          filterDoctorId={filterDoctorId}
          doctors={doctors}
          onGoBack={goBack}
          onGoNext={goNext}
          onGoToday={goToday}
          onFilterStatusChange={setFilterStatus}
          onFilterDoctorChange={setFilterDoctorId}
          onAddSlot={() => setIsAddSlotOpen(true)}
        />

        <div className={cn('flex flex-col', viewMode === 'week' ? 'overflow-auto' : 'flex-1 overflow-hidden h-[520px]')}>
          {viewMode === 'week' ? (
            <ScheduleWeekTable
              weekDays={weekDays}
              visibleDoctors={visibleDoctors}
              filteredSchedules={filteredSchedules}
              loadingList={loadingList}
              onEdit={setEditSlot}
              onDelete={setDeleteSlot}
              onRestore={handleRestore}
            />
          ) : (
            <ScheduleDayGantt
              visibleDoctors={visibleDoctors}
              filteredSchedules={filteredSchedules}
              loadingList={loadingList}
              onEditSlot={setEditSlot}
            />
          )}
        </div>
      </Card>

      <AddSlotDialog
        isOpen={isAddSlotOpen}
        onOpenChange={setIsAddSlotOpen}
        onSuccess={loadSchedules}
      />

      <EditSlotDialog
        slot={editSlot}
        isOpen={!!editSlot}
        onOpenChange={(open) => { if (!open) setEditSlot(null); }}
        onSuccess={loadSchedules}
      />

      <AlertDialog open={!!deleteSlot} onOpenChange={(open) => { if (!open) setDeleteSlot(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tMs('slot.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{tMs('slot.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tMs('slot.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
              {tMs('slot.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
