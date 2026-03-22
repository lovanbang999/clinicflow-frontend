'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClockIcon,
  FloppyDiskIcon,
  TrashIcon,
  CheckCircleIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DayOfWeek, WorkingHours } from '@/types';
import { useDoctorSchedule } from '@/lib/hooks/useDoctorSchedule';
import { Badge } from '@/components/ui/badge';

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: DayOfWeek.MONDAY,    label: 'Thứ Hai',   short: 'T2' },
  { key: DayOfWeek.TUESDAY,   label: 'Thứ Ba',    short: 'T3' },
  { key: DayOfWeek.WEDNESDAY, label: 'Thứ Tư',    short: 'T4' },
  { key: DayOfWeek.THURSDAY,  label: 'Thứ Năm',   short: 'T5' },
  { key: DayOfWeek.FRIDAY,    label: 'Thứ Sáu',   short: 'T6' },
  { key: DayOfWeek.SATURDAY,  label: 'Thứ Bảy',   short: 'T7' },
  { key: DayOfWeek.SUNDAY,    label: 'Chủ Nhật',  short: 'CN' },
];

const DEFAULT_START = '08:00';
const DEFAULT_END   = '17:00';

interface DayConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  /** true when this day's current config differs from the saved workingHours */
  dirty: boolean;
}

interface Props {
  doctorId: string;
}

function buildInitialConfig(saved: WorkingHours[]): Record<DayOfWeek, DayConfig> {
  const base = {} as Record<DayOfWeek, DayConfig>;
  DAYS_OF_WEEK.forEach(({ key }) => {
    const found = saved.find((wh) => wh.dayOfWeek === key);
    base[key] = {
      enabled: !!found,
      startTime: found?.startTime ?? DEFAULT_START,
      endTime: found?.endTime   ?? DEFAULT_END,
      dirty: false,
    };
  });
  return base;
}

function minutesToStr(total: number) {
  const h = Math.floor(total / 60).toString().padStart(2, '0');
  const m = (total % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function strToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatDuration(start: string, end: string) {
  const diff = strToMinutes(end) - strToMinutes(start);
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}ph` : `${h}h`) : `${m}ph`;
}

export function DoctorWorkingHoursGrid({ doctorId }: Props) {
  const { workingHours, loadingHours, savingHours, fetchWorkingHours, saveWorkingHours, deleteWorkingHours } =
    useDoctorSchedule();

  const [config, setConfig] = useState<Record<DayOfWeek, DayConfig>>(() =>
    buildInitialConfig([]),
  );

  // When workingHours loaded from API, reset config
  useEffect(() => {
    setConfig(buildInitialConfig(workingHours));
  }, [workingHours]);

  useEffect(() => {
    if (doctorId) fetchWorkingHours(doctorId);
  }, [doctorId, fetchWorkingHours]);

  // Handlers

  const toggleDay = useCallback((day: DayOfWeek) => {
    setConfig((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled, dirty: true },
    }));
  }, []);

  const updateTime = useCallback((day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
    setConfig((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value, dirty: true },
    }));
  }, []);

  const handleSave = useCallback(
    async (day: DayOfWeek) => {
      const c = config[day];
      if (!c.enabled) {
        // Delete
        try {
          await deleteWorkingHours(doctorId, day);
          setConfig((prev) => ({ ...prev, [day]: { ...prev[day], dirty: false } }));
        } catch {
          /* toast inside hook */
        }
        return;
      }
      if (strToMinutes(c.startTime) >= strToMinutes(c.endTime)) {
        toast.error('Giờ bắt đầu phải trước giờ kết thúc');
        return;
      }
      try {
        await saveWorkingHours(doctorId, day, c.startTime, c.endTime);
        setConfig((prev) => ({ ...prev, [day]: { ...prev[day], dirty: false } }));
      } catch {
        /* toast inside hook */
      }
    },
    [config, doctorId, saveWorkingHours, deleteWorkingHours],
  );

  const handleSaveAll = useCallback(async () => {
    const dirtyDays = DAYS_OF_WEEK.filter(({ key }) => config[key].dirty);
    if (dirtyDays.length === 0) {
      toast.info('Không có thay đổi nào cần lưu');
      return;
    }
    await Promise.all(dirtyDays.map(({ key }) => handleSave(key)));
  }, [config, handleSave]);

  // Preview: total working hours per week
  const weeklyHours = DAYS_OF_WEEK.reduce((acc, { key }) => {
    const c = config[key];
    if (!c.enabled) return acc;
    const diff = strToMinutes(c.endTime) - strToMinutes(c.startTime);
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  const dirtyCount = DAYS_OF_WEEK.filter(({ key }) => config[key].dirty).length;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClockIcon size={20} weight="duotone" className="text-[#1392ec]" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Lịch làm việc theo tuần</h2>
            <p className="text-xs text-slate-500">
              Cấu hình giờ làm việc từng ngày. Mỗi thay đổi cần lưu riêng hoặc lưu tất cả cùng lúc.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 text-xs">
              <WarningIcon size={12} className="mr-1" /> {dirtyCount} ngày chưa lưu
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={savingHours || dirtyCount === 0}
            className="h-8 px-3 bg-[#1392ec] hover:bg-[#1180d0] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            <FloppyDiskIcon size={14} weight="bold" className="mr-1" />
            Lưu tất cả
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loadingHours ? (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {DAYS_OF_WEEK.map(({ key, label, short }) => {
            const c = config[key];
            const isValid = strToMinutes(c.startTime) < strToMinutes(c.endTime);
            const duration  = c.enabled ? formatDuration(c.startTime, c.endTime) : null;

            return (
              <Card
                key={key}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150',
                  c.enabled
                    ? 'border-[#1392ec]/30 bg-blue-50/40 dark:bg-blue-950/20'
                    : 'border-slate-200 bg-white dark:bg-slate-900',
                  c.dirty && 'ring-1 ring-amber-400/60',
                )}
              >
                {/* Day label */}
                <div className="w-24 shrink-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold',
                        c.enabled
                          ? 'bg-[#1392ec] text-white'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                      )}
                    >
                      {short}
                    </span>
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        c.enabled ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400',
                      )}
                    >
                      {label}
                    </span>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => toggleDay(key)}
                  className={cn(
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0',
                    c.enabled ? 'bg-[#1392ec]' : 'bg-slate-200 dark:bg-slate-700',
                  )}
                  aria-label={c.enabled ? 'Tắt ngày này' : 'Bật ngày này'}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                      c.enabled ? 'translate-x-4' : 'translate-x-1',
                    )}
                  />
                </button>

                {/* Time pickers */}
                <div
                  className={cn(
                    'flex items-center gap-2 flex-1 transition-opacity',
                    !c.enabled && 'opacity-30 pointer-events-none',
                  )}
                >
                  <label className="text-xs text-slate-500 shrink-0">Từ</label>
                  <input
                    type="time"
                    value={c.startTime}
                    onChange={(e) => updateTime(key, 'startTime', e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm px-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 cursor-pointer"
                  />
                  <label className="text-xs text-slate-500 shrink-0">đến</label>
                  <input
                    type="time"
                    value={c.endTime}
                    onChange={(e) => updateTime(key, 'endTime', e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm px-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 cursor-pointer"
                  />

                  {/* Duration badge */}
                  {duration && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'ml-2 text-xs',
                        isValid
                          ? 'border-emerald-300 text-emerald-600 bg-emerald-50'
                          : 'border-red-300 text-red-500 bg-red-50',
                      )}
                    >
                      <ClockIcon size={11} className="mr-1" />
                      {isValid ? duration : 'Giờ không hợp lệ'}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {c.dirty && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave(key)}
                        disabled={savingHours}
                        className="h-8 px-2 text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg cursor-pointer"
                        title="Lưu ngày này"
                      >
                        <FloppyDiskIcon size={15} weight="bold" />
                      </Button>
                    </>
                  )}
                  {!c.dirty && c.enabled && (
                    <CheckCircleIcon size={18} weight="fill" className="text-emerald-500" />
                  )}
                  {c.enabled && !c.dirty && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { toggleDay(key); }}
                      className="h-8 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="Xóa ca làm việc ngày này"
                    >
                      <TrashIcon size={14} weight="bold" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview summary */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <CheckCircleIcon size={16} weight="duotone" className="text-emerald-500" />
          <span>
            <strong>{DAYS_OF_WEEK.filter(({ key }) => config[key].enabled).length}</strong> ngày làm việc/tuần
          </span>
          <span className="mx-1 text-slate-300">|</span>
          <ClockIcon size={14} className="text-[#1392ec]" />
          <span>Tổng <strong>{minutesToStr(weeklyHours)}</strong>/tuần</span>
        </div>
        {dirtyCount > 0 && (
          <span className="text-xs text-amber-600 font-medium">
            Nhớ lưu trước khi rời trang!
          </span>
        )}
      </div>
    </div>
  );
}
