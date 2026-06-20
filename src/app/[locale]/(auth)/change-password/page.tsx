'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { EyeIcon, EyeOffIcon, Lock, ShieldAlert, LogOut } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { toast } from 'sonner';

import { useAuthStore } from '@/lib/store/authStore';
import { usersApi } from '@/lib/api/auth/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { useAuth } from '@/lib/hooks/auth/useAuth';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { logout } = useAuth();

  const t = useTranslations('auth.changePassword');
  const tValidation = useTranslations('validation');

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (!formData.currentPassword) {
      newErrors.currentPassword = tValidation('required', { field: t('currentPassword') });
      isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = tValidation('required', { field: t('newPassword') });
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('passwordTooShort');
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = tValidation('required', { field: t('confirmPassword') });
      isValid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
      isValid = false;
    }

    if (formData.newPassword && formData.currentPassword && formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = t('passwordSameAsOld');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await usersApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success(t('success'), {
        description: t('successDescription'),
      });

      // Clear the temporary password flag in the store
      if (user) {
        setUser({ ...user, isPasswordTemp: false });
      }

      // Redirect to their dashboard
      const ROLE_DASHBOARD: Record<string, string> = {
        ADMIN: '/admin/users',
        DOCTOR: '/doctor/schedule',
        RECEPTIONIST: '/receptionist',
        TECHNICIAN: '/technician/lab-worklist',
        PATIENT: '/patient',
      };

      setTimeout(() => {
        const target = user ? (ROLE_DASHBOARD[user.role] ?? '/') : '/login';
        router.push(target);
      }, 1500);
    } catch (err: unknown) {
      let errorMsg = t('failed');
      if (err && typeof err === 'object' && 'response' in err) {
        const responseData = (err as { response?: { data?: { message?: string } } }).response?.data;
        if (responseData?.message) {
          errorMsg = responseData.message;
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-50 to-white">
      {/* Soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
        <LanguageSwitcher />
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 border-slate-200 hover:bg-slate-100 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          {t('logoutButton')}
        </Button>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur supports-backdrop-filter:bg-white/70">
          <CardHeader className="space-y-3 text-center">
            {/* Logo */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
              <Image
                src="/logo.svg"
                alt="Smart Clinic Logo"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {t('title')}
              </CardTitle>
              <CardDescription className="text-sm">{t('subtitle')}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Alert banner for password security requirement */}
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-xs space-y-1 font-medium leading-relaxed">
                <span className="font-semibold block text-amber-900">{t('securityAlertTitle')}</span>
                {t('securityAlertDesc')}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">
                  {t('currentPassword')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10 pr-11',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-blue-600/30',
                      errors.currentPassword ? 'border-red-500 focus-visible:ring-red-500/30' : '',
                    ].join(' ')}
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {showCurrent ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                  </button>
                </div>

                {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword}</p>}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  {t('newPassword')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10 pr-11',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-blue-600/30',
                      errors.newPassword ? 'border-red-500 focus-visible:ring-red-500/30' : '',
                    ].join(' ')}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {showNew ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                  </button>
                </div>

                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  {t('confirmPassword')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10 pr-11',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-blue-600/30',
                      errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500/30' : '',
                    ].join(' ')}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {showConfirm ? <EyeIcon className="h-5 w-5" /> : <EyeOffIcon className="h-5 w-5" />}
                  </button>
                </div>

                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-blue-600 text-base font-medium shadow-sm hover:bg-blue-700 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    {t('submitting')}
                  </span>
                ) : (
                  t('submitButton')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
