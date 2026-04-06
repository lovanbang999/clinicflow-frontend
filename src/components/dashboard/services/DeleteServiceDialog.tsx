'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WarningIcon, TrashIcon } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { type Service } from './types';

type Props = {
  service: Service | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Caller handles the actual API call */
  onConfirm: (id: string) => Promise<void>;
};

export function DeleteServiceDialog({ service, open, onOpenChange, onConfirm }: Props) {
  const t = useTranslations('adminServices.deleteService');
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!service) return;
    setDeleting(true);
    try {
      await onConfirm(service.id);
      onOpenChange(false);
    } catch {
      // toast already shown by hook
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <WarningIcon size={20} weight="fill" />
            </div>
            <DialogTitle className="text-red-600">{t('title')}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="px-6 py-5">
          <p className="text-sm text-[#64748b]">
            {t('message', { name: service?.name ?? '' })}
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
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {deleting ? (
              <><span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{t('deleting')}</>
            ) : (
              <><TrashIcon size={16} weight="fill" />{t('confirm')}</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
