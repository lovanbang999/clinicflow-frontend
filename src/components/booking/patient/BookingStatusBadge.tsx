'use client';

import { BookingStatus } from '@/types';
import { useTranslations } from 'next-intl';

interface BookingStatusBadgeProps {
  status: BookingStatus;
}

const STATUS_STYLE: Record<BookingStatus, { labelKey: string; className: string }> = {
  [BookingStatus.PENDING]:          { labelKey: 'pending',         className: 'text-amber-600 bg-amber-50' },
  [BookingStatus.CONFIRMED]:        { labelKey: 'confirmed',        className: 'text-emerald-600 bg-emerald-50' },
  [BookingStatus.CHECKED_IN]:       { labelKey: 'checkedIn',        className: 'text-indigo-600 bg-indigo-50' },
  [BookingStatus.IN_PROGRESS]:      { labelKey: 'inProgress',       className: 'text-purple-600 bg-purple-50' },
  [BookingStatus.AWAITING_RESULTS]: { labelKey: 'awaitingResults', className: 'text-amber-600 bg-amber-50' },
  [BookingStatus.COMPLETED]:        { labelKey: 'completed',        className: 'text-slate-500 bg-slate-100' },
  [BookingStatus.CANCELLED]:        { labelKey: 'cancelled',        className: 'text-red-500 bg-red-50' },
  [BookingStatus.QUEUED]:           { labelKey: 'queued',           className: 'text-blue-600 bg-blue-50' },
  [BookingStatus.NO_SHOW]:          { labelKey: 'noShow',           className: 'text-slate-500 bg-slate-100' },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const t = useTranslations('booking');
  const style = STATUS_STYLE[status];
  if (!style) return null;

  return (
    <span className={`inline-block text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${style.className}`}>
      {t(style.labelKey)}
    </span>
  );
}
