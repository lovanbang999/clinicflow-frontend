'use client';

import {
  WarningCircleIcon,
  SpinnerIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface ConfirmDeleteDialogProps {
  deletingDate: string | null;
  onClose: () => void;
  onConfirm: (date: string) => Promise<void>;
  isSaving: boolean;
}

export function ConfirmDeleteDialog({
  deletingDate,
  onClose,
  onConfirm,
  isSaving,
}: ConfirmDeleteDialogProps) {
  const t = useTranslations('doctorSchedule.offDays');

  const handleConfirm = async () => {
    if (deletingDate) {
      await onConfirm(deletingDate);
      onClose();
    }
  };

  return (
    <Dialog open={!!deletingDate} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <WarningCircleIcon size={22} weight="duotone" className="text-amber-500" />
            {t('cancelModal.title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 pt-2">
            {t('cancelModal.description')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 flex-col sm:flex-row mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl cursor-pointer border-slate-200 text-slate-600 flex-1 sm:flex-none"
          >
            {t('cancelModal.cancelBtn')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer font-semibold gap-2 flex-1 sm:flex-none"
          >
            {isSaving ? (
              <SpinnerIcon size={14} className="animate-spin" />
            ) : (
              <TrashIcon size={16} weight="bold" />
            )}
            {t('cancelModal.confirmBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
