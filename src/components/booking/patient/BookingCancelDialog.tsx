'use client';

import { useTranslations } from 'next-intl';
import { WarningIcon, XIcon, CircleNotchIcon, XCircleIcon } from '@phosphor-icons/react';

interface BookingCancelDialogProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BookingCancelDialog({ isOpen, isSubmitting, onClose, onConfirm }: BookingCancelDialogProps) {
  const t = useTranslations('booking');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      {/* Sheet on mobile, modal on sm+ */}
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden">
        {/* Drag indicator (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-0">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <WarningIcon size={20} weight="fill" className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900">{t('confirmCancel')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('cancelWarning')}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="px-5 pt-4 pb-6 flex gap-2.5">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('back')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <CircleNotchIcon size={15} className="animate-spin" />
            ) : (
              <XCircleIcon size={15} weight="fill" />
            )}
            {isSubmitting ? t('processing') : t('cancelBooking')}
          </button>
        </div>
      </div>
    </div>
  );
}
