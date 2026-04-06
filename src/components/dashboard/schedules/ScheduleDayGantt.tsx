'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminScheduleSlot } from '@/types';
import { getDoctorColor, VisibleDoctor } from './schedule.types';

type Props = {
  visibleDoctors: VisibleDoctor[];
  filteredSchedules: AdminScheduleSlot[];
  loadingList: boolean;
  onEditSlot: (slot: AdminScheduleSlot) => void;
};

const DAY_COLUMNS = Array.from({ length: 24 }, (_, i) => ({
  label: `${i.toString().padStart(2, '0')}:00`,
  key: `hour-${i}`,
}));

function parseTimeStr(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function getSlotStyle(start: string, end: string): React.CSSProperties {
  const totalMins = 24 * 60;
  const startMins = Math.min(Math.max(parseTimeStr(start), 0), totalMins);
  const endMins = Math.min(Math.max(parseTimeStr(end), 0), totalMins);
  if (startMins >= endMins) return { display: 'none' };
  return {
    left: `${(startMins / totalMins) * 100}%`,
    width: `${((endMins - startMins) / totalMins) * 100}%`,
  };
}

export function ScheduleDayGantt({ visibleDoctors, filteredSchedules, loadingList, onEditSlot }: Props) {
  const tMs = useTranslations('adminSchedules.masterSchedule');

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <div className="flex-1 overflow-auto bg-white relative flex">
        {/* Left: Doctor names column */}
        <div className="w-56 shrink-0 flex flex-col border-r border-[#e5e7eb] sticky left-0 z-20 bg-white shadow-[1px_0_0_0_#e5e7eb]">
          <div className="h-12 border-b border-[#e5e7eb] bg-[#f8fafc] flex items-center px-4 font-bold text-xs text-[#64748b] uppercase tracking-wider shrink-0">
            {tMs('doctors')}
          </div>
          <div className="flex-1 flex flex-col">
            {loadingList ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : visibleDoctors.length === 0 ? (
              <div className="p-4 text-xs text-[#64748b] text-center mt-4">{tMs('noData')}</div>
            ) : (
              visibleDoctors.map((doc) => {
                if (!doc) return null;
                const color = getDoctorColor(doc.id);
                return (
                  <div key={doc.id} className="flex items-center px-4 h-[88px] shrink-0 border-b border-[#e5e7eb] bg-white">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={cn('size-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0', color.bg, color.text)}>
                        {doc.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <p className="text-sm font-bold text-[#111518] truncate w-28" title={doc.fullName}>{doc.fullName}</p>
                        <p className="text-xs text-[#64748b] truncate w-28">
                          {(doc as { doctorProfile?: { specialties?: string[] } }).doctorProfile?.specialties?.[0] ?? 'Đa khoa'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Gantt grid */}
        <div className="flex flex-col flex-1 shrink-0">
          {/* Hour header */}
          <div className="h-12 flex border-b border-[#e5e7eb] bg-[#f8fafc] shrink-0 min-w-[1920px]">
            {DAY_COLUMNS.map((col) => (
              <div key={col.key} className="flex-1 border-r border-[#e5e7eb]/50 flex items-center justify-center text-xs font-medium text-[#64748b]">
                {col.label}
              </div>
            ))}
          </div>

          {/* Doctor rows */}
          <div className="flex-1 flex flex-col min-w-[1920px]">
            {!loadingList && visibleDoctors.map((doc) => {
              if (!doc) return null;
              const color = getDoctorColor(doc.id);
              const docSlots = filteredSchedules.filter((s) => s.doctorId === doc.id);
              return (
                <div key={doc.id} className="h-[88px] shrink-0 border-b border-[#e5e7eb] relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {DAY_COLUMNS.map((col, idx) => (
                      <div key={col.key + idx} className="flex-1 border-r border-[#e5e7eb]/20" />
                    ))}
                  </div>
                  {/* Slot bars */}
                  {docSlots.map((slot) => {
                    const style = getSlotStyle(slot.startTime, slot.endTime);
                    if (style.display === 'none') return null;
                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          'absolute top-3 bottom-3 border-l-4 rounded-r-md px-2 py-1.5 cursor-pointer hover:shadow-md hover:opacity-90 transition-all overflow-hidden',
                          color.bg, color.border,
                          !slot.isActive && 'opacity-60 bg-gray-100 border-gray-400',
                        )}
                        style={style}
                        onClick={() => onEditSlot(slot)}
                        title={`${slot.startTime}–${slot.endTime} · ${slot.maxPatients} BN${slot.room?.name ? ` · ${slot.room.name}` : ''} — Nhấp để chỉnh sửa`}
                      >
                        <p className={cn('text-xs font-bold leading-tight line-clamp-1', !slot.isActive ? 'text-gray-700' : color.textDark)}>
                          {slot.startTime}–{slot.endTime}
                        </p>
                        <p className={cn('text-[10px]', !slot.isActive ? 'text-gray-500' : color.textLight)}>
                          {slot.maxPatients} BN {slot.room?.name && `· ${slot.room.name}`} {!slot.isActive && '(Đã tắt)'}
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
}
