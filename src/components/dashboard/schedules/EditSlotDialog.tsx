'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CalendarCheckIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { adminSchedulesApi } from '@/lib/api/admin-schedules';
import { AdminScheduleSlot, AdminUpdateScheduleDto } from '@/types';

function Field({
  label, htmlFor, required, children, className,
}: {
  label: string; htmlFor?: string; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

const SLOT_TYPES = ['checkup', 'followup', 'consultation', 'procedure', 'therapy'] as const;

type EditSlotDialogProps = {
  slot: AdminScheduleSlot | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

interface EditSlotForm {
  startTime: string;
  endTime: string;
  maxPatients: string;
  room: string;
  type: string;
  notes: string;
  isActive: boolean;
}

export function EditSlotDialog({ slot, isOpen, onOpenChange, onSuccess }: EditSlotDialogProps) {
  const t = useTranslations('adminSchedules.addSlot');
  const tSlot = useTranslations('adminSchedules.masterSchedule.slot');

  const [form, setForm] = useState<EditSlotForm>({
    startTime: '', endTime: '', maxPatients: '', room: '', type: '', notes: '', isActive: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EditSlotForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (slot && isOpen) {
      setForm({
        startTime: slot.startTime ?? '',
        endTime: slot.endTime ?? '',
        maxPatients: String(slot.maxPatients ?? ''),
        room: (slot as { room?: string }).room ?? '',
        type: slot.type ?? '',
        notes: slot.notes ?? '',
        isActive: slot.isActive,
      });
      setErrors({});
    }
  }, [slot, isOpen]);

  const set = <K extends keyof EditSlotForm>(key: K, value: EditSlotForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditSlotForm, string>> = {};
    if (!form.startTime || !form.endTime) {
      newErrors.startTime = t('errors.timeRequired');
      newErrors.endTime = t('errors.timeRequired');
    } else if (form.startTime >= form.endTime) {
      newErrors.endTime = t('errors.invalidTime');
    }
    if (!form.maxPatients || parseInt(form.maxPatients, 10) < 1) {
      newErrors.maxPatients = t('errors.maxPatientsRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!slot || !validate()) return;
    setIsSubmitting(true);
    try {
      const payload: AdminUpdateScheduleDto = {
        startTime: form.startTime,
        endTime: form.endTime,
        maxPatients: parseInt(form.maxPatients, 10),
        room: form.room || undefined,
        type: form.type || undefined,
        notes: form.notes || undefined,
        isActive: form.isActive,
      };
      await adminSchedulesApi.updateSchedule(slot.id, payload);
      toast.success('Cập nhật lịch thành công');
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Cập nhật thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!slot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <PencilSimpleIcon size={20} weight="fill" />
            </div>
            <DialogTitle>{tSlot('edit')}</DialogTitle>
          </div>
          <p className="text-xs text-[#94a3b8] ml-12">
            BS. {slot.doctor?.fullName} — {String(slot.date).slice(0, 10)}
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('startTime')} htmlFor="edit-start" required>
              <Input
                id="edit-start"
                type="time"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.startTime && 'border-red-400')}
              />
              {errors.startTime && <p className="text-xs text-red-500">{errors.startTime}</p>}
            </Field>
            <Field label={t('endTime')} htmlFor="edit-end" required>
              <Input
                id="edit-end"
                type="time"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.endTime && 'border-red-400')}
              />
              {errors.endTime && <p className="text-xs text-red-500">{errors.endTime}</p>}
            </Field>
          </div>

          {/* Max patients + room */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('maxPatients')} htmlFor="edit-max" required>
              <Input
                id="edit-max"
                type="number"
                min="1"
                value={form.maxPatients}
                onChange={(e) => set('maxPatients', e.target.value)}
                className={cn('h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]', errors.maxPatients && 'border-red-400')}
              />
              {errors.maxPatients && <p className="text-xs text-red-500">{errors.maxPatients}</p>}
            </Field>
            <Field label={t('room')} htmlFor="edit-room">
              <Input
                id="edit-room"
                placeholder={t('roomPlaceholder')}
                value={form.room}
                onChange={(e) => set('room', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec]"
              />
            </Field>
          </div>

          {/* Type */}
          <Field label={t('type')} htmlFor="edit-type">
            <Select value={form.type} onValueChange={(v) => set('type', v)}>
              <SelectTrigger id="edit-type" className="h-10 rounded-xl border-[#e2e8f0]">
                <SelectValue placeholder={t('typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {SLOT_TYPES.map((typeKey) => (
                  <SelectItem key={typeKey} value={typeKey}>
                    {t(`typeOptions.${typeKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Notes */}
          <Field label={t('notes')} htmlFor="edit-notes">
            <textarea
              id="edit-notes"
              rows={3}
              placeholder={t('notesPlaceholder')}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="w-full resize-none rounded-xl border border-[#e2e8f0] px-3 py-2 text-sm text-[#111518] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/20 transition"
            />
          </Field>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
            <div>
              <p className="text-sm font-semibold text-[#111518]">Hoạt động</p>
              <p className="text-xs text-[#64748b] mt-0.5">Cho phép bệnh nhân đặt lịch vào slot này</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.isActive}
              onClick={() => set('isActive', !form.isActive)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
                form.isActive ? 'bg-[#1392ec]' : 'bg-[#e2e8f0]',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
                  form.isActive ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#f0f3f4]">
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-[#64748b] border border-[#e5e7eb] hover:bg-gray-50 transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#1392ec] text-white rounded-xl text-sm font-semibold hover:bg-[#1180d0] transition-all shadow-sm disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? (
              <><span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />{t('saving')}</>
            ) : (
              <><CalendarCheckIcon size={16} weight="fill" />Lưu thay đổi</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
