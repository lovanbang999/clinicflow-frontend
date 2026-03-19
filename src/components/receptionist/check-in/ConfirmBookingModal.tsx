'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CheckCircleIcon, XIcon } from '@phosphor-icons/react';
import { Booking } from '@/types';

interface ConfirmBookingModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

export function ConfirmBookingModal({
  isOpen,
  booking,
  onClose,
  onConfirm,
  isSubmitting,
}: ConfirmBookingModalProps) {
  const t = useTranslations('dashboard.receptionist.checkInManagement.confirmModal');

  if (!isOpen || !booking) return null;

  const bookingCode = booking.bookingCode ?? `#${booking.id.slice(0, 6).toUpperCase()}`;
  const formattedTime = booking.startTime
    ? `${booking.startTime}, ${format(new Date(booking.bookingDate), 'MMM dd')}`
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <CheckCircleIcon size={22} weight="fill" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{t('title')}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Description */}
        <div className="px-6 pb-4">
          <p className="text-sm text-slate-500">{t('description')}</p>
        </div>

        {/* Appointment Details Card */}
        <div className="mx-6 mb-6 border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('appointmentDetails')}</p>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('patientLabel')}</span>
              <span className="text-sm font-semibold text-slate-900">{booking.patientProfile?.fullName ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('bookingIdLabel')}</span>
              <span className="text-sm font-semibold text-slate-900">{bookingCode}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('timeLabel')}</span>
              <span className="text-sm font-semibold text-slate-900">{formattedTime}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{t('doctorLabel')}</span>
              <span className="text-sm font-semibold text-slate-900">{booking.doctor?.fullName ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancelBtn')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-white bg-[#1570EF] hover:bg-[#0F5ED4] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? '...' : t('confirmBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
