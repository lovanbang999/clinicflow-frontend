'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XIcon, WarningCircleIcon } from '@phosphor-icons/react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: CancelBookingModalProps) {
  const t = useTranslations('dashboard.receptionist.checkInManagement.cancelModal');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    await onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                 <WarningCircleIcon size={24} weight="fill" />
             </div>
             <h3 className="text-xl font-bold text-slate-900">{t('title')}</h3>
          </div>
          <button 
             onClick={onClose}
             className="text-slate-400 hover:text-slate-600 transition-colors p-2 cursor-pointer"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-500 mb-6">{t('description')}</p>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">
              {t('reasonLabel')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('reasonPlaceholder')}
              className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 resize-none text-sm placeholder:text-slate-400 text-slate-900"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            {t('cancelBtn')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? '...' : t('confirmCancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
