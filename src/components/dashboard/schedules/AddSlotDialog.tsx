'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { CalendarPlusIcon, CalendarCheckIcon } from '@phosphor-icons/react';
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
import { useEffect } from 'react';
import { adminSchedulesApi } from '@/lib/api/admin/admin-schedules';
import { adminDoctorsApi } from '@/lib/api/admin/admin-doctors';
import { adminRoomsApi, AdminRoom } from '@/lib/api/admin/admin-rooms';
import { User } from '@/types';

// Sub-components
function Field({
  label,
  htmlFor,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label
        htmlFor={htmlFor}
        className="text-xs font-bold text-[#64748b] uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

// Form state
interface AddSlotForm {
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  maxPatients: string;
  roomId: string;
  type: string;
  notes: string;
}

const DEFAULT_FORM: AddSlotForm = {
  doctorId: '',
  date: '',
  startTime: '',
  endTime: '',
  maxPatients: '',
  roomId: '',
  type: '',
  notes: '',
};

// Props
type AddSlotDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

const SLOT_TYPES = [
  'checkup',
  'followup',
  'consultation',
  'procedure',
  'therapy',
] as const;

export function AddSlotDialog({ isOpen, onOpenChange, onSuccess }: AddSlotDialogProps) {
  const t = useTranslations('adminSchedules.addSlot');

  const [form, setForm] = useState<AddSlotForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof AddSlotForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [rooms, setRooms] = useState<AdminRoom[]>([]);

  useEffect(() => {
    if (isOpen && doctors.length === 0) {
      // Fetch dynamic doctors and rooms when dialog opens
      Promise.all([
        adminDoctorsApi.getDoctors({ isActive: true, limit: 50 }),
        adminRoomsApi.getActiveRooms()
      ]).then(([doctorsRes, roomsRes]) => {
        setDoctors(doctorsRes.users as unknown as User[]);
        setRooms(roomsRes);
      }).catch(err => {
        console.error('Failed to load doctors or rooms', err);
      });
    }
  }, [isOpen, doctors.length]);

  const set = <K extends keyof AddSlotForm>(key: K, value: AddSlotForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm(DEFAULT_FORM);
      setErrors({});
    }
    onOpenChange(open);
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AddSlotForm, string>> = {};
    if (!form.doctorId) newErrors.doctorId = t('errors.doctorRequired');
    if (!form.date) newErrors.date = t('errors.dateRequired');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      await adminSchedulesApi.createSchedule({
        doctorId: form.doctorId,
        date: new Date(form.date).toISOString(),
        startTime: form.startTime,
        endTime: form.endTime,
        maxPatients: parseInt(form.maxPatients, 10),
        roomId: form.roomId || undefined,
        type: form.type || undefined,
        notes: form.notes || undefined,
      });
      toast.success('Successfully created slot!');
      setForm(DEFAULT_FORM);
      setErrors({});
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create slot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm(DEFAULT_FORM);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center shrink-0">
              <CalendarPlusIcon size={20} weight="fill" />
            </div>
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
          <p className="text-xs text-[#94a3b8] ml-12">{t('subtitle')}</p>
        </DialogHeader>

        {/* Form body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Section: General info */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#1392ec] uppercase tracking-wider">
              {t('sectionGeneral')}
            </p>

            {/* Doctor */}
            <Field label={t('doctor')} htmlFor="add-slot-doctor" required>
              <Select value={form.doctorId} onValueChange={(v) => set('doctorId', v)}>
                <SelectTrigger
                  id="add-slot-doctor"
                  className={cn(
                    'w-full h-10 rounded-xl border-[#e2e8f0]',
                    errors.doctorId && 'border-red-400',
                  )}
                >
                  <SelectValue placeholder={t('doctorPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {doc.fullName} {(doc as any).doctorProfile?.specialties?.length ? `(${(doc as any).doctorProfile.specialties[0]})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && <p className="text-xs text-red-500 mt-0.5">{errors.doctorId}</p>}
            </Field>

            {/* Room + Type */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('room')} htmlFor="add-slot-room">
                <Select value={form.roomId} onValueChange={(v) => set('roomId', v)}>
                  <SelectTrigger
                    id="add-slot-room"
                    className="w-full h-10 rounded-xl border-[#e2e8f0]"
                  >
                    <SelectValue placeholder={t('roomPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label={t('type')} htmlFor="add-slot-type">
                <Select value={form.type} onValueChange={(v) => set('type', v)}>
                  <SelectTrigger
                    id="add-slot-type"
                    className="w-full h-10 rounded-xl border-[#e2e8f0]"
                  >
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
            </div>
          </div>

          <div className="border-t border-[#f0f3f4]" />

          {/* Section: Slot Details */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#1392ec] uppercase tracking-wider">
              {t('sectionDetails')}
            </p>

            {/* Date + Max Patients */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('date')} htmlFor="add-slot-date" required>
                <Input
                  id="add-slot-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => set('date', e.target.value)}
                  className={cn(
                    'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                    errors.date && 'border-red-400 focus-visible:border-red-400',
                  )}
                />
                {errors.date && <p className="text-xs text-red-500 mt-0.5">{errors.date}</p>}
              </Field>

              <Field label={t('maxPatients')} htmlFor="add-slot-max" required>
                <Input
                  id="add-slot-max"
                  type="number"
                  min="1"
                  placeholder={t('maxPatientsPlaceholder')}
                  value={form.maxPatients}
                  onChange={(e) => set('maxPatients', e.target.value)}
                  className={cn(
                    'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                    errors.maxPatients && 'border-red-400',
                  )}
                />
                {errors.maxPatients && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.maxPatients}</p>
                )}
              </Field>
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('startTime')} htmlFor="add-slot-start" required>
                <Input
                  id="add-slot-start"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)}
                  className={cn(
                    'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                    errors.startTime && 'border-red-400',
                  )}
                />
                {errors.startTime && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.startTime}</p>
                )}
              </Field>

              <Field label={t('endTime')} htmlFor="add-slot-end" required>
                <Input
                  id="add-slot-end"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)}
                  className={cn(
                    'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                    errors.endTime && 'border-red-400',
                  )}
                />
                {errors.endTime && <p className="text-xs text-red-500 mt-0.5">{errors.endTime}</p>}
              </Field>
            </div>

            {/* Notes */}
            <Field label={t('notes')} htmlFor="add-slot-notes">
              <textarea
                id="add-slot-notes"
                rows={3}
                placeholder={t('notesPlaceholder')}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                className="w-full resize-none rounded-xl border border-[#e2e8f0] px-3 py-2 text-sm text-[#111518] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/20 transition"
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-[#f0f3f4]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-[#64748b] border border-[#e5e7eb] hover:bg-gray-50 transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 bg-[#1392ec] text-white rounded-xl text-sm font-semibold hover:bg-[#1180d0] transition-all shadow-sm shadow-[#1392ec]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <CalendarCheckIcon size={16} weight="fill" />
                {t('save')}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
