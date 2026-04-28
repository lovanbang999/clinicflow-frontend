'use client';

import { useTranslations } from 'next-intl';
import { WarningIcon, XIcon } from '@phosphor-icons/react';
import { useState } from 'react';

interface BookingCancelDialogProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function BookingCancelDialog({ isOpen, isSubmitting, onClose, onConfirm }: BookingCancelDialogProps) {
  const t = useTranslations('booking');
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  if (!isOpen) return null;

  const isValid = reason.trim().length >= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden">
        {/* Drag indicator (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 px-5 pt-6">
          <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
            <WarningIcon size={22} weight="fill" className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-slate-900">{t('confirmCancel')}</h3>
            <p className="text-sm text-slate-500 mt-1">{t('cancelWarning')}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-5 pt-5 pb-2">
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {t('cancelReason')}
          </label>
          
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.values(t.raw('cancelSuggestions') as Record<string, string>).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setReason(suggestion)}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600 rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <textarea
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            placeholder={t('cancelPlaceholder')}
            className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm text-slate-700 resize-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Actions */}
        <div className="px-5 pt-4 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 py-3 border border-slate-200 text-slate-600 text-sm font-bold rounded-2xl hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('back')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !isValid}
            className="flex-2 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-red-200 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isSubmitting ? t('processing') : t('cancelBooking')}
          </button>
        </div>
      </div>
    </div>
  );
}
