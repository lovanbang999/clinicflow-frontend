'use client';

import { useState } from 'react';
import { WarningIcon, TrashIcon } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import { BackendUser } from '@/types';
import { useAdminDoctors } from '@/lib/hooks/admin/useAdminDoctors';

interface DeleteDoctorDialogProps {
  doctor: BackendUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function DeleteDoctorDialog({ doctor, open, onOpenChange, onDeleted }: DeleteDoctorDialogProps) {
  const t = useTranslations('adminDoctors.deleteDoctor');
  const { deleteDoctor } = useAdminDoctors();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!doctor) return;
    setIsDeleting(true);
    try {
      await deleteDoctor(doctor.id);
      onDeleted?.();
      onOpenChange(false);
    } catch {
      // toast handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <WarningIcon size={20} weight="fill" />
            </div>
            <DialogTitle className="text-red-600">{t('title')}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          <p className="text-sm text-[#64748b]">
            {t('message', { name: doctor?.fullName ?? '' })}
          </p>
          <p className="text-xs text-[#94a3b8] mt-2">{t('warning')}</p>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#f0f3f4]">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-[#64748b] border border-[#e5e7eb] hover:bg-gray-50 transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all shadow-sm shadow-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isDeleting ? (
              <>
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t('deleting')}
              </>
            ) : (
              <>
                <TrashIcon size={16} weight="fill" />
                {t('confirm')}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
