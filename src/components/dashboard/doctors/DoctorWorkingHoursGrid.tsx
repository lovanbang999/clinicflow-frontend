'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ClockIcon,
  FloppyDiskIcon,
  CheckCircleIcon,
  WarningIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DayOfWeek, WorkingHours } from '@/types';
import { useDoctorSchedule } from '@/lib/hooks/appointment/useDoctorSchedule';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK: { key: DayOfWeek }[] = [
  { key: DayOfWeek.MONDAY },
  { key: DayOfWeek.TUESDAY },
  { key: DayOfWeek.WEDNESDAY },
  { key: DayOfWeek.THURSDAY },
  { key: DayOfWeek.FRIDAY },
  { key: DayOfWeek.SATURDAY },
  { key: DayOfWeek.SUNDAY },
];

const DEFAULT_START = '08:00';
const DEFAULT_END   = '17:00';

interface DayConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStartTime: string | null;
  breakEndTime: string | null;
  breakType: 'none' | 'lunch_90' | 'lunch_30' | 'custom';
  dirty: boolean;
}

interface Props {
  doctorId: string;
}

function getBreakType(start: string | null | undefined, end: string | null | undefined): 'none' | 'lunch_90' | 'lunch_30' | 'custom' {
  if (!start || !end) return 'none';
  if (start === '12:00' && end === '13:30') return 'lunch_90';
  if (start === '12:00' && end === '12:30') return 'lunch_30';
  return 'custom';
}

function buildInitialConfig(saved: WorkingHours[]): Record<DayOfWeek, DayConfig> {
  const base = {} as Record<DayOfWeek, DayConfig>;
  DAYS_OF_WEEK.forEach(({ key }) => {
    const found = saved.find((wh) => wh.dayOfWeek === key);
    const breakStartTime = found?.breakStartTime ?? null;
    const breakEndTime = found?.breakEndTime ?? null;
    base[key] = {
      enabled: !!found,
      startTime: found?.startTime ?? DEFAULT_START,
      endTime: found?.endTime   ?? DEFAULT_END,
      breakStartTime,
      breakEndTime,
      breakType: getBreakType(breakStartTime, breakEndTime),
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


export function DoctorWorkingHoursGrid({ doctorId }: Props) {
  const t = useTranslations('doctorSettings.workingHours');

  const {
    workingHours,
    loadingHours,
    savingHours,
    fetchWorkingHours,
    saveWorkingHours,
    deleteWorkingHours,
    bulkUpdateWorkingHours,
  } = useDoctorSchedule();

  const [config, setConfig] = useState<Record<DayOfWeek, DayConfig>>(() =>
    buildInitialConfig([]),
  );

  useEffect(() => {
    setConfig(buildInitialConfig(workingHours));
  }, [workingHours]);

  useEffect(() => {
    if (doctorId) fetchWorkingHours(doctorId);
  }, [doctorId, fetchWorkingHours]);

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

  const updateBreak = useCallback((day: DayOfWeek, field: 'breakStartTime' | 'breakEndTime', value: string | null) => {
    setConfig((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value, dirty: true },
    }));
  }, []);

  const changeBreakType = useCallback((day: DayOfWeek, type: 'none' | 'lunch_90' | 'lunch_30' | 'custom') => {
    setConfig((prev) => {
      let breakStartTime: string | null = null;
      let breakEndTime: string | null = null;
      if (type === 'lunch_90') {
        breakStartTime = '12:00';
        breakEndTime = '13:30';
      } else if (type === 'lunch_30') {
        breakStartTime = '12:00';
        breakEndTime = '12:30';
      } else if (type === 'custom') {
        breakStartTime = prev[day].breakStartTime || '12:00';
        breakEndTime = prev[day].breakEndTime || '13:00';
      }
      return {
        ...prev,
        [day]: {
          ...prev[day],
          breakType: type,
          breakStartTime,
          breakEndTime,
          dirty: true,
        },
      };
    });
  }, []);

  const handleSave = useCallback(
    async (day: DayOfWeek) => {
      const c = config[day];
      if (!c.enabled) {
        try {
          await deleteWorkingHours(doctorId, day);
          setConfig((prev) => ({ ...prev, [day]: { ...prev[day], dirty: false } }));
        } catch { /* toast inside hook */ }
        return;
      }
      if (strToMinutes(c.startTime) >= strToMinutes(c.endTime)) {
        toast.error(t('invalidTimeError'));
        return;
      }
      if (c.breakStartTime && c.breakEndTime) {
        if (strToMinutes(c.breakStartTime) >= strToMinutes(c.breakEndTime)) {
          toast.error(t('breakTimeOrderError'));
          return;
        }
        if (strToMinutes(c.breakStartTime) < strToMinutes(c.startTime) || strToMinutes(c.breakEndTime) > strToMinutes(c.endTime)) {
          toast.error(t('breakTimeRangeError'));
          return;
        }
      }
      try {
        await saveWorkingHours(doctorId, day, c.startTime, c.endTime, c.breakStartTime, c.breakEndTime);
        setConfig((prev) => ({ ...prev, [day]: { ...prev[day], dirty: false } }));
      } catch { /* toast inside hook */ }
    },
    [config, doctorId, saveWorkingHours, deleteWorkingHours, t],
  );

  const handleSaveAll = useCallback(async () => {
    const dirtyDays = DAYS_OF_WEEK.filter(({ key }) => config[key].dirty);
    if (dirtyDays.length === 0) {
      toast.info(t('noChangesError'));
      return;
    }

    // Validate all dirty days
    for (const { key } of dirtyDays) {
      const c = config[key];
      if (c.enabled) {
        if (strToMinutes(c.startTime) >= strToMinutes(c.endTime)) {
          toast.error(t('invalidWorkingHoursFor', { day: t(`days.${key}`) }));
          return;
        }
        if (c.breakStartTime && c.breakEndTime) {
          if (strToMinutes(c.breakStartTime) >= strToMinutes(c.breakEndTime)) {
            toast.error(t('invalidBreakTimeFor', { day: t(`days.${key}`) }));
            return;
          }
          if (strToMinutes(c.breakStartTime) < strToMinutes(c.startTime) || strToMinutes(c.breakEndTime) > strToMinutes(c.endTime)) {
            toast.error(t('breakTimeRangeErrorFor', { day: t(`days.${key}`) }));
            return;
          }
        }
      }
    }

    const items = dirtyDays.map(({ key }) => ({
      dayOfWeek: key,
      startTime: config[key].startTime,
      endTime: config[key].endTime,
      enabled: config[key].enabled,
      breakStartTime: config[key].breakStartTime,
      breakEndTime: config[key].breakEndTime,
    }));

    try {
      await bulkUpdateWorkingHours(doctorId, items);
      setConfig((prev) => {
        const next = { ...prev };
        dirtyDays.forEach(({ key }) => {
          next[key] = { ...next[key], dirty: false };
        });
        return next;
      });
    } catch { /* toast inside hook */ }
  }, [config, doctorId, bulkUpdateWorkingHours, t]);

  const weeklyHours = DAYS_OF_WEEK.reduce((acc, { key }) => {
    const c = config[key];
    if (!c.enabled) return acc;
    let diff = strToMinutes(c.endTime) - strToMinutes(c.startTime);
    if (c.breakStartTime && c.breakEndTime) {
      const bDiff = strToMinutes(c.breakEndTime) - strToMinutes(c.breakStartTime);
      if (bDiff > 0 && strToMinutes(c.breakStartTime) >= strToMinutes(c.startTime) && strToMinutes(c.breakEndTime) <= strToMinutes(c.endTime)) {
        diff -= bDiff;
      }
    }
    return acc + (diff > 0 ? diff : 0);
  }, 0);

  const dirtyCount = DAYS_OF_WEEK.filter(({ key }) => config[key].dirty).length;

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClockIcon size={20} weight="duotone" className="text-[#1392ec]" />
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('title')}</h2>
            <p className="text-xs text-slate-500">{t('subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <Badge variant="outline" className="border-amber-400 text-amber-600 bg-amber-50 text-xs gap-1">
              <WarningIcon size={12} /> {dirtyCount} {t('unsavedDays')}
            </Badge>
          )}
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={savingHours || dirtyCount === 0}
            className="h-8 px-3 bg-[#1392ec] hover:bg-[#1180d0] text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            <FloppyDiskIcon size={14} weight="bold" className="mr-1" />
            {t('saveAll')}
          </Button>
        </div>
      </div>

      {/* Table */}
      {loadingHours ? (
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 w-32">{t('headers.day')}</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 w-20">{t('headers.status')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 w-72">{t('headers.workingHours')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 w-80">{t('headers.breakTime')}</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-300 w-28">{t('headers.duration')}</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-300 w-24">{t('headers.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {DAYS_OF_WEEK.map(({ key }) => {
                const c = config[key];
                const isValid = strToMinutes(c.startTime) < strToMinutes(c.endTime);

                const label = t(`days.${key}` as Parameters<typeof t>[0]);
                const short = t(`days.${key.toLowerCase().substring(0, 3)}` as Parameters<typeof t>[0]);
                
                // Duration calculation subtracting breaks
                let duration = null;
                if (c.enabled) {
                  let diff = strToMinutes(c.endTime) - strToMinutes(c.startTime);
                  if (c.breakStartTime && c.breakEndTime) {
                    const bDiff = strToMinutes(c.breakEndTime) - strToMinutes(c.breakStartTime);
                    if (bDiff > 0 && strToMinutes(c.breakStartTime) >= strToMinutes(c.startTime) && strToMinutes(c.breakEndTime) <= strToMinutes(c.endTime)) {
                      diff -= bDiff;
                    }
                  }
                  if (diff > 0) {
                    const h = Math.floor(diff / 60);
                    const m = diff % 60;
                    duration = h > 0 ? (m > 0 ? `${h}${t('hourShort')} ${m}${t('minuteShort')}` : `${h}${t('hourShort')}`) : `${m}${t('minuteShort')}`;
                  } else {
                    duration = '—';
                  }
                }

                return (
                  <tr
                    key={key}
                    className={cn(
                      'transition-colors',
                      c.enabled
                        ? 'bg-blue-50/40 dark:bg-blue-950/10'
                        : 'bg-white dark:bg-slate-900/40',
                      c.dirty && 'outline outline-1 outline-amber-300/70',
                    )}
                  >
                    {/* Day */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold shrink-0',
                            c.enabled
                              ? 'bg-[#1392ec] text-white'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
                          )}
                        >
                          {short}
                        </span>
                        <span className={cn('font-semibold', c.enabled ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400')}>
                          {label}
                        </span>
                      </div>
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleDay(key)}
                        className={cn(
                          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer',
                          c.enabled ? 'bg-[#1392ec]' : 'bg-slate-200 dark:bg-slate-700',
                        )}
                        aria-label={c.enabled ? t('turnOffDay') : t('turnOnDay')}
                      >
                        <span
                          className={cn(
                            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                            c.enabled ? 'translate-x-4' : 'translate-x-1',
                          )}
                        />
                      </button>
                    </td>

                    {/* Working Hours Input */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={c.startTime}
                          disabled={!c.enabled}
                          onChange={(e) => updateTime(key, 'startTime', e.target.value)}
                          className={cn(
                            'h-9 w-28 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm px-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30',
                            !c.enabled && 'opacity-30 cursor-not-allowed',
                            c.enabled && 'cursor-pointer',
                          )}
                        />
                        <span className="text-slate-400 text-xs">{t('to')}</span>
                        <input
                          type="time"
                          value={c.endTime}
                          disabled={!c.enabled}
                          onChange={(e) => updateTime(key, 'endTime', e.target.value)}
                          className={cn(
                            'h-9 w-28 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm px-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30',
                            !c.enabled && 'opacity-30 cursor-not-allowed',
                            c.enabled && 'cursor-pointer',
                          )}
                        />
                      </div>
                    </td>

                    {/* Break Time configuration */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <select
                          value={c.breakType}
                          disabled={!c.enabled}
                          onChange={(e) => changeBreakType(key, e.target.value as 'none' | 'lunch_90' | 'lunch_30' | 'custom')}
                          className={cn(
                            'h-9 w-60 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm px-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30',
                            !c.enabled && 'opacity-30 cursor-not-allowed',
                            c.enabled && 'cursor-pointer',
                          )}
                        >
                          <option value="none">{t('breakTypes.none')}</option>
                          <option value="lunch_90">{t('breakTypes.lunch_90')}</option>
                          <option value="lunch_30">{t('breakTypes.lunch_30')}</option>
                          <option value="custom">{t('breakTypes.custom')}</option>
                        </select>

                        {c.enabled && c.breakType === 'custom' && (
                          <div className="flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            <input
                              type="time"
                              value={c.breakStartTime || ''}
                              onChange={(e) => updateBreak(key, 'breakStartTime', e.target.value)}
                              className="h-8 w-24 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-xs px-2 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 text-slate-800 dark:text-slate-100"
                            />
                            <span className="text-xs text-slate-400">{t('to')}</span>
                            <input
                              type="time"
                              value={c.breakEndTime || ''}
                              onChange={(e) => updateBreak(key, 'breakEndTime', e.target.value)}
                              className="h-8 w-24 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-xs px-2 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 text-slate-800 dark:text-slate-100"
                            />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Duration Badge */}
                    <td className="px-4 py-3">
                      {c.enabled && duration && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            isValid
                              ? 'border-emerald-300 text-emerald-600 bg-emerald-50'
                              : 'border-red-300 text-red-500 bg-red-50',
                          )}
                        >
                          <ClockIcon size={11} className="mr-1" />
                          {isValid ? duration : t('invalidHours')}
                        </Badge>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {c.dirty && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSave(key)}
                            disabled={savingHours}
                            className="h-8 w-8 p-0 text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg cursor-pointer"
                            title={t('saveThisDay')}
                          >
                            <FloppyDiskIcon size={15} weight="bold" />
                          </Button>
                        )}
                        {!c.dirty && c.enabled && (
                          <CheckCircleIcon size={18} weight="fill" className="text-emerald-500" />
                        )}
                        {c.enabled && !c.dirty && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleDay(key)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            title={t('deleteThisDay')}
                          >
                            <TrashIcon size={14} weight="bold" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <CheckCircleIcon size={16} weight="duotone" className="text-emerald-500" />
          <span>
            <strong>{DAYS_OF_WEEK.filter(({ key }) => config[key].enabled).length}</strong> {t('daysPerWeek')}
          </span>
          <span className="mx-1 text-slate-300">|</span>
          <ClockIcon size={14} className="text-[#1392ec]" />
          <span>{t('total')} <strong>{minutesToStr(weeklyHours)}</strong>{t('perWeek')}</span>
        </div>
        {dirtyCount > 0 && (
          <span className="text-xs text-amber-600 font-medium">{t('rememberToSave')}</span>
        )}
      </div>
    </div>
  );
}
