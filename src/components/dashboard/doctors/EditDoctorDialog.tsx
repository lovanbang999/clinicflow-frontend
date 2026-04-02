'use client';

import { useState, useEffect } from 'react';
import { PencilSimpleIcon, UserIcon } from '@phosphor-icons/react';
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
import { useTranslations } from 'next-intl';
import { useAdminDoctors } from '@/lib/hooks/useAdminDoctors';
import { BackendUser } from '@/types';
import { ALL_SPECIALTIES } from './types';

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

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
        checked ? 'bg-[#1392ec]' : 'bg-[#e2e8f0]',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

// Form state
interface EditDoctorForm {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  qualifications: string;
  yearsOfExperience: string;
  bio: string;
  isActive: boolean;
}

// Props
interface EditDoctorDialogProps {
  doctor: BackendUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDoctorUpdated?: () => void;
}

// Main component
export function EditDoctorDialog({ doctor, open, onOpenChange, onDoctorUpdated }: EditDoctorDialogProps) {
  const t = useTranslations('adminDoctors.editDoctor');
  const { updateDoctorProfile } = useAdminDoctors();

  const [form, setForm] = useState<EditDoctorForm>({
    fullName: '',
    email: '',
    phone: '',
    specialty: '',
    qualifications: '',
    yearsOfExperience: '',
    bio: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EditDoctorForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when doctor changes
  useEffect(() => {
    if (doctor && open) {
      const profile = doctor.doctorProfile;
      setForm({
        fullName: doctor.fullName || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        specialty: profile?.specialties?.[0] || '',
        qualifications: profile?.qualifications?.join(', ') || '',
        yearsOfExperience: profile?.yearsOfExperience != null ? String(profile.yearsOfExperience) : '',
        bio: profile?.bio || '',
        isActive: doctor.isActive,
      });
      setErrors({});
    }
  }, [doctor, open]);

  const set = <K extends keyof EditDoctorForm>(key: K, value: EditDoctorForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditDoctorForm, string>> = {};
    if (!form.fullName.trim()) newErrors.fullName = t('errors.nameRequired');
    if (!form.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('errors.emailInvalid');
    }
    if (!form.specialty) newErrors.specialty = t('errors.specialtyRequired');
    if (form.yearsOfExperience) {
      const val = parseInt(form.yearsOfExperience, 10);
      if (isNaN(val) || val < 0 || val > 60) newErrors.yearsOfExperience = t('errors.experienceInvalid');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !doctor) return;
    setIsSubmitting(true);
    try {
      const qualsList = form.qualifications
        .split(',')
        .map((q) => q.trim())
        .filter(Boolean);

      await updateDoctorProfile(
        doctor.id,
        {
          specialties: [form.specialty],
          qualifications: qualsList.length > 0 ? qualsList : undefined,
          yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience, 10) : undefined,
          bio: form.bio || undefined,
        },
        {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone || undefined,
          isActive: form.isActive,
        },
      );

      onDoctorUpdated?.();
      onOpenChange(false);
    } catch {
      // toast handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center shrink-0">
              <PencilSimpleIcon size={20} weight="fill" />
            </div>
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
          {doctor && (
            <p className="text-xs text-[#94a3b8] ml-12">{doctor.fullName}</p>
          )}
        </DialogHeader>

        {/* Form body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Section: Account */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#1392ec] uppercase tracking-wider">{t('sectionAccount')}</p>

            {/* Full Name */}
            <Field label={t('fullName')} htmlFor="edit-doctor-fullname" required>
              <Input
                id="edit-doctor-fullname"
                placeholder={t('fullNamePlaceholder')}
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className={cn(
                  'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                  errors.fullName && 'border-red-400 focus-visible:border-red-400',
                )}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-0.5">{errors.fullName}</p>}
            </Field>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('email')} htmlFor="edit-doctor-email" required>
                <Input
                  id="edit-doctor-email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className={cn(
                    'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                    errors.email && 'border-red-400 focus-visible:border-red-400',
                  )}
                />
                {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
              </Field>

              <Field label={t('phone')} htmlFor="edit-doctor-phone">
                <Input
                  id="edit-doctor-phone"
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20"
                />
              </Field>
            </div>
          </div>

          <div className="border-t border-[#f0f3f4]" />

          {/* Section: Profile */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#1392ec] uppercase tracking-wider">{t('sectionProfile')}</p>

            {/* Specialty + Experience */}
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('specialty')} htmlFor="edit-doctor-specialty" required>
                <Select value={form.specialty} onValueChange={(v) => set('specialty', v)}>
                  <SelectTrigger
                    id="edit-doctor-specialty"
                    className={cn(
                      'w-full h-10 rounded-xl border-[#e2e8f0]',
                      errors.specialty && 'border-red-400',
                    )}
                  >
                    <SelectValue placeholder={t('specialtyPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_SPECIALTIES.map((sp) => (
                      <SelectItem key={sp} value={sp}>
                        {sp}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialty && <p className="text-xs text-red-500 mt-0.5">{errors.specialty}</p>}
              </Field>

              <Field label={t('experience')} htmlFor="edit-doctor-experience">
                <Input
                  id="edit-doctor-experience"
                  type="number"
                  min={0}
                  max={60}
                  placeholder={t('experiencePlaceholder')}
                  value={form.yearsOfExperience}
                  onChange={(e) => set('yearsOfExperience', e.target.value)}
                  className={cn(
                    'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                    errors.yearsOfExperience && 'border-red-400',
                  )}
                />
                {errors.yearsOfExperience && (
                  <p className="text-xs text-red-500 mt-0.5">{errors.yearsOfExperience}</p>
                )}
              </Field>
            </div>

            {/* Qualifications */}
            <Field label={t('qualifications')} htmlFor="edit-doctor-qualifications">
              <Input
                id="edit-doctor-qualifications"
                placeholder={t('qualificationsPlaceholder')}
                value={form.qualifications}
                onChange={(e) => set('qualifications', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20"
              />
              <p className="text-xs text-[#94a3b8]">{t('qualificationsHint')}</p>
            </Field>

            {/* Bio */}
            <Field label={t('bio')} htmlFor="edit-doctor-bio">
              <textarea
                id="edit-doctor-bio"
                rows={3}
                placeholder={t('bioPlaceholder')}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                className="w-full resize-none rounded-xl border border-[#e2e8f0] px-3 py-2 text-sm text-[#111518] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/20 transition"
              />
            </Field>
          </div>

          <div className="border-t border-[#f0f3f4]" />

          {/* Account Status */}
          <div className="flex items-center justify-between py-3 px-4 bg-[#f8fafc] rounded-xl border border-[#e5e7eb]">
            <div>
              <p className="text-sm font-semibold text-[#111518]">{t('status')}</p>
              <p className="text-xs text-[#64748b] mt-0.5">{t('statusDesc')}</p>
            </div>
            <div className="flex items-center gap-3">
              <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} />
              <span
                className={cn(
                  'text-xs font-bold uppercase tracking-wider',
                  form.isActive ? 'text-[#1392ec]' : 'text-[#94a3b8]',
                )}
              >
                {form.isActive ? t('statusActive') : t('statusInactive')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-[#f0f3f4]">
          <button
            onClick={handleCancel}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-[#64748b] border border-[#e5e7eb] hover:bg-gray-50 transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
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
                <UserIcon size={16} weight="fill" />
                {t('save')}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
