'use client';

import {
  WarningCircleIcon,
  SpinnerIcon,
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
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { AffectedAppointment } from '@/lib/api/appointment/schedules';

interface PendingCreation {
  date: string;
  reason: string;
  affectedAppointments: AffectedAppointment[];
}

interface ConflictAppointmentsDialogProps {
  pendingCreation: PendingCreation | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSaving: boolean;
}

export function ConflictAppointmentsDialog({
  pendingCreation,
  onClose,
  onConfirm,
  isSaving,
}: ConflictAppointmentsDialogProps) {
  const t = useTranslations('doctorSchedule.offDays');

  return (
    <Dialog open={!!pendingCreation} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-4 space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <WarningCircleIcon size={22} weight="duotone" />
            {t('affectedModal.title')}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400 pt-1">
            {t.rich('affectedModal.description', {
              date: pendingCreation?.date || '',
              count: pendingCreation?.affectedAppointments?.length || 0,
              strong1: (chunks) => <strong>{chunks}</strong>,
              strong2: (chunks) => <strong className="text-red-600">{chunks}</strong>,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Appointment list */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {pendingCreation?.affectedAppointments?.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 dark:bg-red-950/20 dark:border-red-800/30 px-3 py-2"
              >
                <WarningCircleIcon size={16} weight="fill" className="text-red-400 shrink-0" />
                <div className="text-xs flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{appt.patientName}</p>
                  <p className="text-slate-500 truncate">{appt.serviceName} · {appt.startTime}</p>
                </div>
                <Badge variant="outline" className="text-[10px] border-red-200 text-red-500 shrink-0">
                  {appt.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Warning note */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 p-3">
            <WarningCircleIcon size={16} weight="fill" className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {t('affectedModal.footerNote')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl cursor-pointer border-slate-200 text-slate-600"
          >
            {t('cancelModal.cancelBtn')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer font-semibold gap-2"
          >
            {isSaving ? (
              <SpinnerIcon size={14} className="animate-spin" />
            ) : (
              <WarningCircleIcon size={16} weight="bold" />
            )}
            {t('affectedModal.understandBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
