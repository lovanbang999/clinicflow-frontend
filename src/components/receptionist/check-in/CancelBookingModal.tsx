'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { XCircleIcon, XIcon } from '@phosphor-icons/react';
import { Booking } from '@/types';

interface CancelBookingModalProps {
  isOpen: boolean;
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CancelBookingModal({
  isOpen,
  booking,
  onClose,
  onConfirm,
  isSubmitting,
}: CancelBookingModalProps) {
  const t = useTranslations('receptionistCheckIn.cancelModal');
  const [selectedReason, setSelectedReason] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!isOpen || !booking) return null;

  const reasons: string[] = [
    t('reasons.patientRequest'),
    t('reasons.providerUnavailable'),
    t('reasons.schedulingConflict'),
    t('reasons.other'),
  ];

  const handleConfirm = async () => {
    if (!selectedReason) return;
    const fullReason = additionalNotes.trim()
      ? `${selectedReason} — ${additionalNotes.trim()}`
      : selectedReason;
    await onConfirm(fullReason);
    setSelectedReason('');
    setAdditionalNotes('');
  };

  const bookingCode = booking.bookingCode ?? `#${booking.id.slice(0, 6).toUpperCase()}`;
  const initials = (booking.patientProfile?.fullName ?? '??')
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const formattedTime = booking.startTime
    ? `${booking.startTime}`
    : '—';
  const formattedDate = booking.bookingDate
    ? format(new Date(booking.bookingDate), 'EEEE, MMM dd')
    : '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <XCircleIcon size={22} weight="fill" />
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

        {/* Appointment Details Card */}
        <div className="mx-6 mb-5 border border-slate-100 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('appointmentDetails')}</p>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            {/* Patient info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1570EF]/10 text-[#1570EF] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{booking.patientProfile?.fullName ?? '—'}</p>
                <p className="text-xs text-slate-400">ID: {booking.patientProfile?.patientCode ?? bookingCode}</p>
              </div>
            </div>
            {/* Time */}
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{formattedTime}</p>
              <p className="text-xs text-slate-400">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 space-y-5 pb-2">
          {/* Reason for Cancellation */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">{t('reasonLabel')}</p>
            <div className="grid grid-cols-2 gap-2">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-rose-300 hover:bg-rose-50/40 transition-colors"
                >
                  <input
                    type="radio"
                    name="cancellation-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-rose-600 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-slate-700 font-medium">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t('additionalNotesLabel')}</p>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={t('additionalNotesPlaceholder')}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 resize-none text-sm placeholder:text-slate-400 text-slate-900 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-5 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('cancelBtn')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason || isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {isSubmitting ? '...' : t('confirmCancelBtn')}
          </button>
        </div>

        {/* Notification hint */}
        <div className="px-6 pb-5 flex items-center justify-center gap-1.5">
          <p className="text-xs text-slate-400 text-center">{t('notificationHint')}</p>
        </div>
      </div>
    </div>
  );
}
