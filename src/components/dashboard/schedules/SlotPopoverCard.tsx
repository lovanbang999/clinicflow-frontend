'use client';

import { useTranslations } from 'next-intl';
import { PencilSimpleIcon, TrashIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { AdminScheduleSlot } from '@/types';
import { DoctorColor } from './schedule.types';

type Props = {
  slot: AdminScheduleSlot;
  colorClass: Pick<DoctorColor, 'pill'>;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
};

export function SlotPopoverCard({ slot, colorClass, onEdit, onDelete, onRestore }: Props) {
  const tSlot = useTranslations('dashboard.scheduleManagement.masterSchedule.slot');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'text-[11px] font-medium rounded-md px-2 py-1 border leading-tight cursor-pointer hover:opacity-80 transition-opacity select-none',
            slot.isActive ? colorClass.pill : 'bg-slate-100 text-slate-400 border-slate-200 line-through',
          )}
        >
          <span className="font-bold">{slot.startTime}</span>
          <span className="mx-0.5 opacity-60">–</span>
          <span className="font-bold">{slot.endTime}</span>
          <span className="ml-1 opacity-60 text-[10px]">({slot.maxPatients}BN)</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1.5 rounded-xl shadow-xl" align="start" side="right">
        <button
          onClick={onEdit}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[#1392ec]/10 text-[#111518] hover:text-[#1392ec] transition-colors cursor-pointer"
        >
          <PencilSimpleIcon size={14} /> {tSlot('edit')}
        </button>
        {slot.isActive ? (
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-[#111518] hover:text-red-500 transition-colors cursor-pointer"
          >
            <TrashIcon size={14} /> {tSlot('delete')}
          </button>
        ) : (
          <button
            onClick={onRestore}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 text-[#111518] hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <ArrowCounterClockwiseIcon size={14} /> {tSlot('restore')}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
