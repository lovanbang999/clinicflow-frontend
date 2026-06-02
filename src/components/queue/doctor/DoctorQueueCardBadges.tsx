import { useTranslations } from 'next-intl';
import { CalendarBlankIcon, QueueIcon } from '@phosphor-icons/react';
import type { TaskStyle } from './DoctorQueueCardStyles';

export function TaskBadge({
  type,
  style,
}: {
  type: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY';
  style: TaskStyle;
}) {
  const t = useTranslations('doctorWorkspace.queueView');
  const labels = {
    EXAMINATION: t('status.awaitingExam'),
    RESULTS_READY: t('stats.waitingResults'),
    CONSULTATION: t('status.awaitingConsultation'),
  };
  return (
    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${style.labelBg}`}>
      {style.icon}
      {labels[type]}
    </span>
  );
}

export function BookingCode({ code }: { code?: string }) {
  return (
    <span className="px-2 py-0.5 rounded-lg bg-[#f3f4f9] text-[#44474e] text-[10px] font-mono tracking-tight border border-[#c4c6cf]/30">
      {code}
    </span>
  );
}

export function BookingTypeBadge({ isPreBooked }: { isPreBooked?: boolean }) {
  const t = useTranslations('doctorWorkspace.queueView');
  return isPreBooked ? (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1275e2] text-[10px] font-bold border border-[#93c5fd]/60">
      <CalendarBlankIcon size={10} weight="fill" />
      {t('status.preBooked')}
    </span>
  ) : (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f0fdf4] text-[#16a34a] text-[10px] font-bold border border-[#86efac]/60">
      <QueueIcon size={10} weight="fill" />
      {t('status.walkIn')}
    </span>
  );
}

export function UrgentBadge({ minutes }: { minutes?: number }) {
  const t = useTranslations('doctorWorkspace.queueView');
  return (
    <span className="px-2 py-0.5 rounded-md bg-[#FCEBEB] text-[#A32D2D] text-[10px] font-bold border border-[#F7C1C1] animate-pulse">
      {t('waitingTooLong', { minutes: minutes ?? 0, defaultMessage: `Waiting too long — ${minutes ?? 0} mins` })}
    </span>
  );
}
