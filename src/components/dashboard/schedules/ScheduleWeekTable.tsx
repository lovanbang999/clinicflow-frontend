'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminScheduleSlot } from '@/types';
import { SlotPopoverCard } from './SlotPopoverCard';
import { DAY_LABELS, getDoctorColor, VisibleDoctor } from './schedule.types';

type Props = {
  weekDays: Date[];
  visibleDoctors: VisibleDoctor[];
  filteredSchedules: AdminScheduleSlot[];
  loadingList: boolean;
  onEdit: (slot: AdminScheduleSlot) => void;
  onDelete: (slot: AdminScheduleSlot) => void;
  onRestore: (slot: AdminScheduleSlot) => void;
};

const TODAY_STR = format(new Date(), 'yyyy-MM-dd');

export function ScheduleWeekTable({
  weekDays,
  visibleDoctors,
  filteredSchedules,
  loadingList,
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  const tMs = useTranslations('adminSchedules.masterSchedule');

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-48 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
              {tMs('doctors')}
            </th>
            {weekDays.map((day, i) => {
              const isTodayDay = format(day, 'yyyy-MM-dd') === TODAY_STR;
              return (
                <th
                  key={day.toISOString()}
                  className={cn(
                    'px-3 py-3 text-center text-xs font-bold uppercase tracking-wider border-r border-slate-100 min-w-[120px]',
                    isTodayDay ? 'text-[#1392ec] bg-blue-50/60' : 'text-slate-500',
                  )}
                >
                  <div className="font-bold">{DAY_LABELS[i]}</div>
                  <div className={cn('text-[11px] font-normal mt-0.5', isTodayDay ? 'text-[#1392ec]' : 'text-slate-400')}>
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
                <td colSpan={8} className="px-4 py-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                </td>
              </tr>
            ))
          ) : visibleDoctors.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">
                {tMs('noData')}
              </td>
            </tr>
          ) : (
            visibleDoctors.map((doc) => {
              if (!doc) return null;
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
                        <p className="font-semibold text-slate-900 text-sm truncate max-w-[120px]" title={doc.fullName}>
                          BS. {doc.fullName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {(doc as { doctorProfile?: { specialties?: string[] } }).doctorProfile?.specialties?.[0] ?? 'Đa khoa'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {weekDays.map((day) => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    const isTodayDay = dayStr === TODAY_STR;
                    const daySlots = filteredSchedules.filter(
                      (s) => s.doctorId === doc.id && format(new Date(s.date), 'yyyy-MM-dd') === dayStr,
                    );
                    return (
                      <td
                        key={day.toISOString()}
                        className={cn('px-2 py-2 align-top border-r border-slate-100 min-h-[60px]', isTodayDay && 'bg-blue-50/30')}
                      >
                        {daySlots.length === 0 ? (
                          <span className="text-slate-200 text-xs select-none">—</span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {daySlots.map((slot) => (
                              <SlotPopoverCard
                                key={slot.id}
                                slot={slot}
                                colorClass={color}
                                onEdit={() => onEdit(slot)}
                                onDelete={() => onDelete(slot)}
                                onRestore={() => onRestore(slot)}
                              />
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
}
