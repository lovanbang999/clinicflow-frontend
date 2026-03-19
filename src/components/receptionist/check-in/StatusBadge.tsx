'use client';

import { useTranslations } from 'next-intl';
import { BookingStatus } from '@/types';

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations('dashboard.receptionist.checkInManagement.stats');

  switch (status) {
    case BookingStatus.PENDING:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
          {t('pending')}
        </span>
      );
    case BookingStatus.CONFIRMED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {t('confirmed')}
        </span>
      );
    case BookingStatus.CHECKED_IN:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
          Checked In
        </span>
      );
    case BookingStatus.COMPLETED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
          {t('completed')}
        </span>
      );
    case BookingStatus.CANCELLED:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {t('cancelled')}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {status}
        </span>
      );
  }
}
