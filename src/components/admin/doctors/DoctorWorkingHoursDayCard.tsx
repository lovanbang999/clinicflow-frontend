'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DayOfWeek } from '@/types';
import {
  ClockIcon,
  FloppyDiskIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@phosphor-icons/react';

interface DayConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  dirty: boolean;
}

interface DoctorWorkingHoursDayCardProps {
  dayKey: DayOfWeek;
  label: string;
  short: string;
  config: DayConfig;
  isValid: boolean;
  duration: string | null;
  savingHours: boolean;
  toggleDay: (day: DayOfWeek) => void;
  updateTime: (day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => void;
  handleSave: (day: DayOfWeek) => void;
  t: (key: string) => string; // translation function
}

export function DoctorWorkingHoursDayCard({
  dayKey,
  label,
  short,
  config: c,
  isValid,
  duration,
  savingHours,
  toggleDay,
  updateTime,
  handleSave,
  t,
}: DoctorWorkingHoursDayCardProps) {
  return (
    <Card
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
        onClick={() => toggleDay(dayKey)}
        className={cn(
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0',
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

      {/* Time pickers */}
      <div
        className={cn(
          'flex items-center gap-2 flex-1 transition-opacity',
          !c.enabled && 'opacity-30 pointer-events-none',
        )}
      >
        <label className="text-xs text-slate-500 shrink-0">{t('from')}</label>
        <input
          type="time"
          value={c.startTime}
          onChange={(e) => updateTime(dayKey, 'startTime', e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-sm px-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1392ec]/30 cursor-pointer"
        />
        <label className="text-xs text-slate-500 shrink-0">{t('to')}</label>
        <input
          type="time"
          value={c.endTime}
          onChange={(e) => updateTime(dayKey, 'endTime', e.target.value)}
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
            {isValid ? duration : t('invalidHours')}
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
              onClick={() => handleSave(dayKey)}
              disabled={savingHours}
              className="h-8 px-2 text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg cursor-pointer"
              title={t('saveThisDay')}
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
            onClick={() => { toggleDay(dayKey); }}
            className="h-8 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
            title={t('deleteThisDay')}
          >
            <TrashIcon size={14} weight="bold" />
          </Button>
        )}
      </div>
    </Card>
  );
}
