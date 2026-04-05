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
import { useAdminUsers } from '@/lib/hooks/useAdminUsers';
import { UserRole, User } from '@/types';

type Role = UserRole;

interface EditUserForm {
  fullName: string;
  email: string;
  phone: string;
  role: Role | '';
  isActive: boolean;
}

const ROLES: Role[] = ['ADMIN', 'RECEPTIONIST', 'TECHNICIAN'];

const ROLE_STYLES: Record<string, string> = {
  DOCTOR: 'bg-blue-50 text-blue-700',
  PATIENT: 'bg-purple-50 text-purple-700',
  RECEPTIONIST: 'bg-amber-50 text-amber-700',
  ADMIN: 'bg-indigo-50 text-indigo-700',
};

// Field wrapper
function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
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
      </Label>
      {children}
    </div>
  );
}

// Toggle
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

interface EditUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => void;
}

export function EditUserDialog({ user, open, onOpenChange, onUserUpdated }: EditUserDialogProps) {
  const t = useTranslations('adminUsers.editUser');
  const tRoles = useTranslations('adminUsers.table.roles');
  const { updateUser } = useAdminUsers();

  const [form, setForm] = useState<EditUserForm>({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EditUserForm, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && open) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        isActive: user.isActive,
      });
      setErrors({});
    }
  }, [user, open]);

  const set = <K extends keyof EditUserForm>(key: K, value: EditUserForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditUserForm, string>> = {};
    if (!form.fullName.trim()) newErrors.fullName = t('errors.nameRequired');
    if (!form.email.trim()) {
      newErrors.email = t('errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = t('errors.emailInvalid');
    }
    if (!form.role) newErrors.role = t('errors.roleRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setIsSubmitting(true);
    try {
      if (form.role) {
        await updateUser(user.id, {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          role: form.role,
          isActive: form.isActive,
        });
        onUserUpdated?.();
        onOpenChange(false);
      }
    } catch {
      // errors handled by toast in useAdminUsers
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Modal */}
      <DialogContent className="w-full max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center shrink-0">
              <PencilSimpleIcon size={20} weight="fill" />
            </div>
            <DialogTitle>{t('title')}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4">
          {/* Full Name */}
          <Field label={t('fullName')} htmlFor="edit-user-fullname">
            <Input
              id="edit-user-fullname"
              placeholder={t('fullNamePlaceholder')}
              value={form.fullName}
              onChange={(e) => set('fullName', e.target.value)}
              className={cn(
                'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                errors.fullName && 'border-red-400 focus-visible:border-red-400',
              )}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-0.5">{errors.fullName}</p>
            )}
          </Field>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('email')} htmlFor="edit-user-email">
              <Input
                id="edit-user-email"
                type="email"
                placeholder={t('emailPlaceholder')}
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={cn(
                  'h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                  errors.email && 'border-red-400 focus-visible:border-red-400',
                )}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>
              )}
            </Field>

            <Field label={t('phone')} htmlFor="edit-user-phone">
              <Input
                id="edit-user-phone"
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20"
              />
            </Field>
          </div>

          {/* Role */}
          <Field label={t('role')} htmlFor="edit-user-role">
            <Select
              value={form.role}
              onValueChange={(v) => set('role', v as Role)}
            >
              <SelectTrigger
                id="edit-user-role"
                className={cn(
                  'w-full h-10 rounded-xl border-[#e2e8f0] focus-visible:border-[#1392ec] focus-visible:ring-[#1392ec]/20',
                  errors.role && 'border-red-400',
                )}
              >
                <SelectValue placeholder={t('rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        ROLE_STYLES[role],
                      )}
                    >
                      {tRoles(role.charAt(0).toUpperCase() + role.slice(1).toLowerCase())}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-red-500 mt-0.5">{errors.role}</p>
            )}
          </Field>

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
                {form.isActive ? 'Active' : 'Inactive'}
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
            className="flex items-center gap-2 px-5 py-2 bg-[#1392ec] text-white rounded-xl text-sm font-semibold hover:bg-[#1392ec]/90 transition-all shadow-sm shadow-[#1392ec]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
