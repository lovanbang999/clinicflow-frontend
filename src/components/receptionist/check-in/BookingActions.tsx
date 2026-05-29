'use client';

import { useTranslations } from 'next-intl';
import { Booking, BookingStatus } from '@/types';
import { XCircleIcon } from '@phosphor-icons/react';

interface BookingActionsProps {
  booking: Booking;
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCheckIn: (booking: Booking) => void;
}

export function BookingActions({ booking, onConfirm, onCancel, onReschedule, onCheckIn }: BookingActionsProps) {
  const t = useTranslations('receptionistCheckIn.table');

  if (booking.status === BookingStatus.PENDING) {
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onConfirm(booking); }}
          className="bg-[#1570EF] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#0F5ED4] transition-colors cursor-pointer flex items-center gap-1.5 w-20 justify-center"
        >
          {t('confirmBtn')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReschedule(booking); }}
          className="border border-amber-200 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer w-20 justify-center flex items-center"
        >
          {t('rescheduleBtn')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(booking); }}
          className="border border-rose-200 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer w-20 justify-center flex items-center"
        >
          {t('cancelBtn')}
        </button>
      </div>
    );
  }

  if (booking.status === BookingStatus.CONFIRMED) {
    return (
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onCheckIn(booking); }}
          className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer w-20 justify-center flex items-center"
        >
          {t('checkInBtn')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onReschedule(booking); }}
          className="border border-amber-200 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer w-20 justify-center flex items-center"
        >
          {t('rescheduleBtn')}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(booking); }}
          className="border border-rose-200 text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer w-20 justify-center flex items-center"
        >
          {t('cancelBtn')}
        </button>
      </div>
    );
  }

  if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CHECKED_IN) {
    return (
      <span className="text-xs text-slate-400 font-medium px-3">{t('noActions')}</span>
    );
  }

  // CANCELLED / other
  return (
    <span className="text-slate-300 text-sm font-medium flex justify-center">
      <XCircleIcon size={18} />
    </span>
  );
}
