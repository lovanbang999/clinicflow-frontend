'use client';

import { useTranslations } from 'next-intl';
import { FunnelIcon, PlusIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AdminScheduleSlot } from '@/types';
import { STATUS_STYLES } from './schedule.types';

export type { VisibleDoctor } from './schedule.types';

type ViewMode = 'week' | 'day';

type Props = {
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  dateLabel: string;
  isTodayPeriod: boolean;
  filterStatus: string;
  filterDoctorId: string;
  doctors: AdminScheduleSlot['doctor'][];
  onGoBack: () => void;
  onGoNext: () => void;
  onGoToday: () => void;
  onFilterStatusChange: (v: string) => void;
  onFilterDoctorChange: (id: string) => void;
  onAddSlot: () => void;
};

const FILTER_STATUS_VALUES = ['scheduled', 'completed', 'canceled'] as const;

export function ScheduleToolbar({
  viewMode, onViewModeChange,
  dateLabel, isTodayPeriod,
  filterStatus, filterDoctorId, doctors,
  onGoBack, onGoNext, onGoToday,
  onFilterStatusChange, onFilterDoctorChange,
  onAddSlot,
}: Props) {
  const tMs = useTranslations('adminSchedules.masterSchedule');

  return (
    <div className="p-6 border-b border-[#e5e7eb] flex flex-wrap justify-between items-center gap-3 shrink-0">
      {/* Left: title + view toggle + navigation */}
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-lg font-bold text-[#111518]">{tMs('title')}</h3>

        {/* View toggle */}
        <div className="flex items-center bg-[#f1f5f9] rounded-lg p-1">
          {(['week', 'day'] as ViewMode[]).map((m) => (
            <Button
              key={m}
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange(m)}
              className={cn(
                'h-7 px-3 rounded-md text-xs font-bold transition-colors cursor-pointer',
                viewMode === m
                  ? 'bg-white shadow-sm text-[#111518] hover:bg-white hover:text-[#111518]'
                  : 'text-[#64748b] hover:text-[#111518] hover:bg-transparent',
              )}
            >
              {tMs(m)}
            </Button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={onGoBack}
            title={viewMode === 'week' ? tMs('prevWeek') : tMs('prevDay')}
            className="size-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] hover:text-[#111518] transition-colors cursor-pointer"
          >
            <CaretLeftIcon size={14} weight="bold" />
          </button>
          <button
            onClick={onGoToday}
            disabled={isTodayPeriod}
            className={cn(
              'h-8 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer',
              isTodayPeriod
                ? 'border-transparent text-[#94a3b8] cursor-default'
                : 'border-[#e5e7eb] text-[#64748b] hover:bg-[#1392ec]/5 hover:text-[#1392ec] hover:border-[#1392ec]',
            )}
          >
            {tMs('today')}
          </button>
          <button
            onClick={onGoNext}
            title={viewMode === 'week' ? tMs('nextWeek') : tMs('nextDay')}
            className="size-8 rounded-lg border border-[#e5e7eb] flex items-center justify-center text-[#64748b] hover:bg-[#f8fafc] hover:text-[#111518] transition-colors cursor-pointer"
          >
            <CaretRightIcon size={14} weight="bold" />
          </button>
        </div>

        <div className="text-sm font-semibold text-[#64748b]">{dateLabel}</div>
      </div>

      {/* Right: filters + add */}
      <div className="flex gap-2 flex-wrap">
        {/* Doctor filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-9 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer',
                filterDoctorId !== 'all'
                  ? 'border-[#1392ec] text-[#1392ec] bg-[#1392ec]/5 hover:bg-[#1392ec]/10'
                  : 'text-[#64748b] border-[#e5e7eb] hover:bg-[#f8fafc] hover:text-[#111518]',
              )}
            >
              <FunnelIcon size={16} weight={filterDoctorId !== 'all' ? 'fill' : 'bold'} />
              {tMs('filterDoctor')}
              {filterDoctorId !== 'all' && (
                <span className="size-4 rounded-full bg-[#1392ec] text-white text-[10px] flex items-center justify-center font-bold">1</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {tMs('filterDoctor')}
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filterDoctorId === 'all'}
              onCheckedChange={() => onFilterDoctorChange('all')}
              className="cursor-pointer font-medium"
            >
              {tMs('allDoctors')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {doctors.map((doc) => doc && (
              <DropdownMenuCheckboxItem
                key={doc.id}
                checked={filterDoctorId === doc.id}
                onCheckedChange={() => onFilterDoctorChange(filterDoctorId === doc.id ? 'all' : doc.id)}
                className="cursor-pointer"
              >
                BS. {doc.fullName}
              </DropdownMenuCheckboxItem>
            ))}
            {filterDoctorId !== 'all' && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={() => onFilterDoctorChange('all')}
                  className="w-full text-center text-xs text-[#64748b] hover:text-red-500 py-1.5 transition-colors cursor-pointer font-medium"
                >
                  {tMs('clearDoctorFilter')}
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-9 px-4 rounded-xl text-sm font-bold transition-all cursor-pointer',
                filterStatus !== 'all'
                  ? 'border-[#1392ec] text-[#1392ec] bg-[#1392ec]/5 hover:bg-[#1392ec]/10'
                  : 'text-[#64748b] border-[#e5e7eb] hover:bg-[#f8fafc] hover:text-[#111518]',
              )}
            >
              <FunnelIcon size={16} weight={filterStatus !== 'all' ? 'fill' : 'bold'} />
              {tMs('filter')}
              {filterStatus !== 'all' && (
                <span className="size-4 rounded-full bg-[#1392ec] text-white text-[10px] flex items-center justify-center font-bold">1</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-[#94a3b8] uppercase tracking-wider font-bold">
              {tMs('status')}
            </DropdownMenuLabel>
            {FILTER_STATUS_VALUES.map((value) => {
              const styles = STATUS_STYLES[value];
              const isActive = filterStatus === value;
              return (
                <DropdownMenuCheckboxItem
                  key={value}
                  checked={isActive}
                  onCheckedChange={() => onFilterStatusChange(isActive ? 'all' : value)}
                  className="cursor-pointer"
                >
                  <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border', styles.wrapper)}>
                    <span className={cn('size-1.5 rounded-full', styles.dot)} />
                    {tMs(`filterOptions.${value}`)}
                  </span>
                </DropdownMenuCheckboxItem>
              );
            })}
            {filterStatus !== 'all' && (
              <>
                <DropdownMenuSeparator />
                <button
                  onClick={() => onFilterStatusChange('all')}
                  className="w-full text-center text-xs text-[#64748b] hover:text-red-500 py-1.5 transition-colors cursor-pointer font-medium"
                >
                  {tMs('clearAll')}
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Add slot */}
        <Button
          onClick={onAddSlot}
          className="h-9 px-4 bg-[#1392ec] text-white rounded-xl text-sm font-bold hover:bg-[#1180d0] transition-all shadow-md shadow-[#1392ec]/20 cursor-pointer"
        >
          <PlusIcon size={16} weight="bold" /> {tMs('addSlot')}
        </Button>
      </div>
    </div>
  );
}
