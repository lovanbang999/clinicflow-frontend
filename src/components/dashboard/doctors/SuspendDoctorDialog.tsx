'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { LockSimpleIcon, LockSimpleOpenIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { BackendUser } from '@/types';
import { useAuthStore } from '@/lib/store/authStore';
import { cn } from '@/lib/utils';

interface SuspendDoctorDialogProps {
  doctor: BackendUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (doctor: BackendUser, reason: string) => void;
  loading?: boolean;
}

export function SuspendDoctorDialog({
  doctor,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: SuspendDoctorDialogProps) {
  const t = useTranslations('adminDoctors');
  const currentUser = useAuthStore((s) => s.user);
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setReason('');
        setTouched(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!doctor) return null;

  const isSuspending = doctor.isActive;
  const isSelf = currentUser?.id === doctor.id;
  const reasonError = touched && isSuspending && !reason.trim();
  const canConfirm = !isSelf && (!isSuspending || reason.trim().length > 0);

  const handleConfirm = () => {
    if (isSuspending) {
      setTouched(true);
      if (!reason.trim()) return;
    }
    onConfirm(doctor, reason.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div
              className={cn(
                'size-9 rounded-xl flex items-center justify-center shrink-0',
                isSuspending ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600',
              )}
            >
              {isSuspending ? (
                <LockSimpleIcon size={20} weight="fill" />
              ) : (
                <LockSimpleOpenIcon size={20} weight="fill" />
              )}
            </div>
            <DialogTitle>
              {isSuspending
                ? t('suspendDialog.suspendTitle')
                : t('suspendDialog.reinstateTitle')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {isSelf && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <WarningCircleIcon size={18} className="text-red-500 mt-0.5 shrink-0" weight="fill" />
              <p className="text-sm text-red-700 font-medium">
                {t('suspendDialog.selfLockWarning')}
              </p>
            </div>
          )}

          {!isSelf && (
            <p className="text-sm text-slate-600">
              {isSuspending
                ? t('suspendDialog.suspendDesc', { name: doctor.fullName || '' })
                : t('suspendDialog.reinstateDesc', { name: doctor.fullName || '' })}
            </p>
          )}

          {isSuspending && !isSelf && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t('suspendDialog.reasonLabel')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setTouched(true);
                }}
                placeholder={t('suspendDialog.reasonPlaceholder')}
                className={cn(
                  'w-full px-3 py-2 text-sm border rounded-xl resize-none focus:outline-none focus:ring-2 transition-all',
                  reasonError
                    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                    : 'border-slate-200 focus:ring-[#1392ec]/20 focus:border-[#1392ec]',
                )}
              />
              {reasonError && (
                <p className="text-xs text-red-500">{t('suspendDialog.reasonRequired')}</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer disabled:opacity-50"
          >
            {t('suspendDialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !canConfirm}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              isSuspending
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
            )}
          >
            {loading && (
              <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            {isSuspending
              ? t('moreMenu.suspend')
              : t('moreMenu.reinstate')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
