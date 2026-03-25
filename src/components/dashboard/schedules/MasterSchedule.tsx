'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  FunnelIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddSlotDialog } from '@/components/dashboard/schedules/AddSlotDialog';
import { useAdminSchedules } from '@/lib/hooks/useAdminSchedules';
import { Skeleton } from '@/components/ui/skeleton';
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format
} from 'date-fns';
import { vi } from 'date-fns/locale';

const DAY_LABELS_VI = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function MasterSchedule() {
  const t = useTranslations('dashboard.scheduleManagement');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [isAddSlotOpen, setIsAddSlotOpen] = useState<boolean>(false);
  const [currentDate] = useState<Date>(new Date());

  const { schedules, loadingList, fetchSchedules } = useAdminSchedules();

  useEffect(() => {
    let startDate: string;
    let endDate: string;

    if (viewMode === 'day') {
      startDate = startOfDay(currentDate).toISOString();
      endDate = endOfDay(currentDate).toISOString();
    } else {
      startDate = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
      endDate = endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
    }

    fetchSchedules({
      startDate,
      endDate,
      status: filterActive === 'all' ? undefined : filterActive,
    });
  }, [currentDate, viewMode, filterActive, fetchSchedules]);

  const doctors = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const docMap = new Map<string, any>();
    schedules.forEach(slot => {
      if (slot.doctor && !docMap.has(slot.doctor.id)) {
        docMap.set(slot.doctor.id, slot.doctor);
      }
    });
    return Array.from(docMap.values());
  }, [schedules]);

  // Week days for the current week (Mon-Sun)
  const weekDays = useMemo(() =>
    eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 1 }),
      end: endOfWeek(currentDate, { weekStartsOn: 1 }),
    }),
    [currentDate]
  );

  // Day-view helpers (unchanged)
  const getHeaderColumns = () => {
    if (viewMode === 'day') {
      return Array.from({ length: 24 }).map((_, i) => ({
        label: `${i.toString().padStart(2, '0')}:00`,
        key: `hour-${i}`
      }));
    }
    return weekDays.map(d => ({
      label: format(d, 'EEE (dd/MM)', { locale: vi }),
      key: d.toISOString()
    }));
  };

  const parseTimeStr = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const getSlotStyleDay = (start: string, end: string) => {
    const startMins = parseTimeStr(start);
    const endMins = parseTimeStr(end);
    const totalViewMins = 24 * 60;
    const displayStart = Math.min(Math.max(startMins, 0), totalViewMins);
    const displayEnd = Math.min(Math.max(endMins, 0), totalViewMins);
    if (displayStart >= displayEnd) return { display: 'none' };
    return {
      left: `${(displayStart / totalViewMins) * 100}%`,
      width: `${((displayEnd - displayStart) / totalViewMins) * 100}%`,
    };
  };

  const getDoctorColor = (doctorId: string) => {
    const idx = [...doctorId].reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5;
    const colors = [
      { bg: 'bg-blue-100', border: 'border-[#1392ec]', text: 'text-[#1392ec]', textDark: 'text-blue-900', textLight: 'text-[#1392ec]/70', pill: 'bg-blue-100 text-blue-800 border-blue-200' },
      { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-600', textDark: 'text-green-900', textLight: 'text-green-700', pill: 'bg-green-100 text-green-800 border-green-200' },
      { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-600', textDark: 'text-emerald-900', textLight: 'text-emerald-700', pill: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      { bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-600', textDark: 'text-amber-900', textLight: 'text-amber-700', pill: 'bg-amber-100 text-amber-800 border-amber-200' },
      { bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-600', textDark: 'text-rose-900', textLight: 'text-rose-700', pill: 'bg-rose-100 text-rose-800 border-rose-200' },
    ];
    return colors[idx];
  };

  const getDateHeaderLabel = () => {
    if (viewMode === 'day') return format(currentDate, 'dd MMM yyyy', { locale: vi });
    return `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM', { locale: vi })} — ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM/yyyy', { locale: vi })}`;
  };

  const FILTER_OPTIONS = [
    { value: 'scheduled', label: t('masterSchedule.filterOptions.scheduled') },
    { value: 'completed', label: t('masterSchedule.filterOptions.completed') },
    { value: 'canceled', label: t('masterSchedule.filterOptions.canceled') },
  ];

  const STATUS_STYLES: Record<string, { wrapper: string; dot: string }> = {
    scheduled: { wrapper: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
    completed: { wrapper: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    canceled: { wrapper: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
  };

  // WEEK TABLE VIEW
  const WeekTableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {/* Doctor column */}
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-48 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
              {t('masterSchedule.doctors')}
            </th>
            {weekDays.map((day, i) => {
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              return (
                <th key={day.toISOString()} className={cn(
                  'px-3 py-3 text-center text-xs font-bold uppercase tracking-wider border-r border-slate-100 min-w-[110px]',
                  isToday ? 'text-[#1392ec] bg-blue-50/60' : 'text-slate-500'
                )}>
                  <div className="font-bold">{DAY_LABELS_VI[i]}</div>
                  <div className={cn('text-[11px] font-normal mt-0.5', isToday ? 'text-[#1392ec]' : 'text-slate-400')}>
                    {format(day, 'dd/MM')}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loadingList ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={8} className="px-4 py-3"><Skeleton className="h-10 w-full rounded-lg" /></td>
              </tr>
            ))
          ) : doctors.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                {t('masterSchedule.noData') ?? 'Không có lịch nào trong tuần này'}
              </td>
            </tr>
          ) : (
            doctors.map((doc) => {
              const color = getDoctorColor(doc.id);
              return (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Doctor cell */}
                  <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200">
                    <div className="flex items-center gap-2.5">
                      <div className={cn('size-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', color.bg, color.text)}>
                        {doc.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate max-w-[120px]" title={doc.fullName}>BS. {doc.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(doc as any).doctorProfile?.specialties?.[0] ?? 'Đa khoa'}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const daySlots = schedules.filter(s =>
                      s.doctorId === doc.id &&
                      format(new Date(s.date), 'yyyy-MM-dd') === dayStr
                    );
                    const isToday = dayStr === format(new Date(), 'yyyy-MM-dd');
                    return (
                      <td key={day.toISOString()} className={cn(
                        'px-2 py-2 align-top border-r border-slate-100 min-h-[60px]',
                        isToday && 'bg-blue-50/30'
                      )}>
                        {daySlots.length === 0 ? (
                          <span className="text-slate-200 text-xs select-none">—</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {daySlots.map(slot => (
                              <div
                                key={slot.id}
                                title={`${slot.type ?? 'Lịch khám'} · ${slot.startTime}–${slot.endTime} · ${slot.maxPatients} BN`}
                                className={cn(
                                  'text-[11px] font-medium rounded-md px-2 py-1 border leading-tight',
                                  slot.isActive ? color.pill : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                                )}
                              >
                                <span className="font-bold">{slot.startTime}</span>
                                <span className="mx-0.5 opacity-60">–</span>
                                <span className="font-bold">{slot.endTime}</span>
                                <span className="ml-1 opacity-60 text-[10px]">({slot.maxPatients}BN)</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // DAY GANTT VIEW
  const columns = getHeaderColumns();

  const DayGanttView = () => (
    <div className="flex flex-1 overflow-hidden relative">
      <div className="flex-1 overflow-auto bg-white relative flex">
        <div className="w-56 shrink-0 flex flex-col border-r border-[#e5e7eb] sticky left-0 z-20 bg-white shadow-[1px_0_0_0_#e5e7eb]">
          <div className="h-12 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center px-4 font-bold text-xs text-[#64748b] uppercase tracking-wider shrink-0">
            {t('masterSchedule.doctors')}
          </div>
          <div className="flex-1 flex flex-col">
            {loadingList ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : doctors.length === 0 ? (
              <div className="p-4 text-xs text-[#64748b] text-center mt-4">Không có lịch</div>
            ) : (
              doctors.map((doc) => {
                const color = getDoctorColor(doc.id);
                return (
                  <div key={doc.id} className="flex items-center px-4 h-[88px] shrink-0 border-b border-[#e5e7eb] bg-white">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn("size-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0", color.bg, color.text)}>
                        {doc.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-[#111518] truncate w-28" title={doc.fullName}>{doc.fullName}</p>
                        <p className="text-xs text-[#64748b] truncate w-28">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(doc as any).doctorProfile?.specialties?.[0] ?? 'Đa khoa'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 shrink-0">
          <div className="h-12 flex border-b border-[#e5e7eb] bg-[#f8fafc] shrink-0 min-w-[1920px]">
            {columns.map((col) => (
              <div key={col.key} className="flex-1 border-r border-[#e5e7eb]/50 flex items-center justify-center text-xs font-medium text-[#64748b]">
                {col.label}
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col min-w-[1920px]">
            {!loadingList && doctors.map((doc) => {
              const docSlots = schedules.filter(s => s.doctorId === doc.id);
              const color = getDoctorColor(doc.id);
              return (
                <div key={doc.id} className="h-[88px] shrink-0 border-b border-[#e5e7eb] relative">
                  <div className="absolute inset-0 flex pointer-events-none">
                    {columns.map((col, idx) => (
                      <div key={col.key + idx} className="flex-1 border-r border-[#e5e7eb]/20" />
                    ))}
                  </div>
                  {docSlots.map(slot => {
                    const style = getSlotStyleDay(slot.startTime, slot.endTime);
                    if (style.display === 'none') return null;
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "absolute top-3 bottom-3 border-l-4 rounded-r-md px-2 py-1.5 cursor-pointer hover:shadow-md transition-shadow overflow-hidden",
                          color.bg, color.border,
                          !slot.isActive && "opacity-60 bg-gray-100 border-gray-400"
                        )}
                        style={style}
                        title={`${slot.type ?? 'Lịch khám'} · ${slot.startTime}–${slot.endTime} · ${slot.maxPatients} BN`}
                      >
                        <p className={cn('text-xs font-bold leading-tight line-clamp-1', !slot.isActive ? 'text-gray-700' : color.textDark)}>
                          {slot.startTime}–{slot.endTime}
                        </p>
                        <p className={cn('text-[10px]', !slot.isActive ? 'text-gray-500' : color.textLight)}>
                          {slot.maxPatients} BN {!slot.isActive && '(Đã tắt)'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="rounded-2xl border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col p-0 gap-0">
      {/* Header controls */}
      <div className="p-6 border-b border-[#e5e7eb] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-[#111518]">{t('masterSchedule.title')}</h3>
          <div className="flex items-center bg-[#f1f5f9] rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('week')}
              className={cn(
                "h-7 px-3 rounded-md text-xs font-bold transition-colors cursor-pointer",
                viewMode === 'week'
                  ? "bg-white shadow-sm text-[#111518] hover:bg-white hover:text-[#111518]"
                  : "text-[#64748b] hover:text-[#111518] hover:bg-transparent"
              )}
            >
              {t('masterSchedule.week')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('day')}
              className={cn(
                "h-7 px-3 rounded-md text-xs font-bold transition-colors cursor-pointer",
                viewMode === 'day'
                  ? "bg-white shadow-sm text-[#111518] hover:bg-white hover:text-[#111518]"
                  : "text-[#64748b] hover:text-[#111518] hover:bg-transparent"
              )}
            >
              {t('masterSchedule.day')}
            </Button>
          </div>
          <div className="text-sm font-semibold text-[#64748b]">{getDateHeaderLabel()}</div>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-9 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer',
                  filterActive !== 'all'
                    ? 'border-[#1392ec] text-[#1392ec] bg-[#1392ec]/5 hover:bg-[#1392ec]/10'
                    : 'text-[#64748b] border-[#e5e7eb] hover:bg-[#f8fafc] hover:text-[#111518]'
                )}
              >
                <FunnelIcon size={16} weight={filterActive !== 'all' ? 'fill' : 'bold'} />
                {t('masterSchedule.filter')}
                {filterActive !== 'all' && (
                  <span className="size-4 rounded-full bg-[#1392ec] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
                {t('masterSchedule.status')}
              </DropdownMenuLabel>
              {FILTER_OPTIONS.map(({ value, label }) => {
                const styles = STATUS_STYLES[value];
                const isActive = filterActive === value;
                return (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={isActive}
                    onCheckedChange={() => setFilterActive(isActive ? 'all' : value)}
                    className="cursor-pointer"
                  >
                    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border', styles.wrapper)}>
                      <span className={cn('size-1.5 rounded-full', styles.dot)} />
                      {label}
                    </span>
                  </DropdownMenuCheckboxItem>
                );
              })}
              {filterActive !== 'all' && (
                <>
                  <DropdownMenuSeparator />
                  <button
                    onClick={() => setFilterActive('all')}
                    className="w-full text-center text-xs text-[#64748b] hover:text-red-500 py-1.5 transition-colors cursor-pointer font-medium"
                  >
                    {t('masterSchedule.clearAll')}
                  </button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setIsAddSlotOpen(true)}
            className="h-9 px-4 bg-[#1392ec] text-white rounded-xl text-sm font-bold hover:bg-[#1180d0] transition-all shadow-md shadow-[#1392ec]/20 cursor-pointer"
          >
            <PlusIcon size={16} weight="bold" /> {t('masterSchedule.addSlot')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={cn('flex flex-col', viewMode === 'week' ? 'overflow-auto' : 'flex-1 overflow-hidden h-[520px]')}>
        {viewMode === 'week' ? WeekTableView() : DayGanttView()}
      </div>

      <AddSlotDialog
        isOpen={isAddSlotOpen}
        onOpenChange={setIsAddSlotOpen}
        onSuccess={() => {
          const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
          const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString();
          fetchSchedules({
            startDate,
            endDate,
            status: filterActive === 'all' ? undefined : filterActive,
          });
        }}
      />
    </Card>
  );
}
