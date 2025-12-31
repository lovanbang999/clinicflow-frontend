'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { EyeIcon, EyeOffIcon, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
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
import { validateEmail, validatePassword, validatePhone } from '@/lib/utils/validators';
import { Spinner } from '@/components/ui/spinner';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useRouter } from '@/i18n/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const t = useTranslations('auth.register');
  const tValidation = useTranslations('validation');
  const tFields = useTranslations('validation.fields');
  const tCommon = useTranslations('common');

  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    };

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = tValidation('required', { field: tFields('fullName') });
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = tValidation('minLength', { field: tFields('fullName'), min: 2 });
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = tValidation('required', { field: tFields('email') });
    } else if (!validateEmail(formData.email)) {
      newErrors.email = tValidation('email');
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = tValidation('required', { field: tFields('phoneNumber') });
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = tValidation('phone');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = tValidation('required', { field: tFields('password') });
    } else if (!validatePassword(formData.password)) {
      newErrors.password = tValidation('minLength', { field: tFields('password'), min: 6 });
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = tValidation('required', {
        field: tFields('confirmPassword'),
      });
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = tValidation('passwordMismatch');
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error handling is done in useAuth hook
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-50 to-white">
      {/* Soft blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-purple-200/50 blur-3xl" />

      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Back to Home - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('backToHome')}
        </button>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur supports-backdrop-filter:bg-white/70">
          <CardHeader className="space-y-3 text-center">
            {/* Logo */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 ring-1 ring-indigo-600/15">
              <Image
                src="/logo.svg"
                alt="Smart Clinic Logo"
                width={44}
                height={44}
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

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  {t('fullName')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder={t('fullNamePlaceholder')}
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-indigo-600/30',
                      errors.fullName ? 'border-red-500 focus-visible:ring-red-500/30' : '',
                    ].join(' ')}
                  />
                </div>

                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t('email')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-indigo-600/30',
                      errors.email ? 'border-red-500 focus-visible:ring-red-500/30' : '',
                    ].join(' ')}
                  />
                </div>

                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t('phoneNumber')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder={t('phonePlaceholder')}
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-indigo-600/30',
                      errors.phone ? 'border-red-500 focus-visible:ring-red-500/30' : '',
                    ].join(' ')}
                  />
                </div>

                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t('password')} <span className="text-red-500">*</span>
                </Label>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10 pr-11',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-indigo-600/30',
                      errors.password ? 'border-red-500 focus-visible:ring-red-500/30' : '',
                    ].join(' ')}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 cursor-pointer"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeOffIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={[
                      'h-11 pl-10 pr-11',
                      'bg-white',
                      'focus-visible:ring-2 focus-visible:ring-indigo-600/30',
                      errors.confirmPassword
                        ? 'border-red-500 focus-visible:ring-red-500/30'
                        : '',
                    ].join(' ')}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/30 cursor-pointer"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeOffIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-indigo-600 text-base font-medium shadow-sm hover:bg-indigo-700 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner />
                    {t('registering')}
                  </span>
                ) : (
                  t('registerButton')
                )}
              </Button>

              {/* Divider */}
              <div className="relative py-1">
                <div className="h-px w-full bg-slate-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-500">
                  {tCommon('or')}
                </span>
              </div>

              {/* Login Link */}
              <div className="text-center text-sm text-slate-600">
                {t('hasAccount')}{' '}
                <Link href="/login" className="font-semibold text-indigo-700 hover:underline">
                  {t('loginNow')}
                </Link>
              </div>
            </form>

            {/* Footer tiny note */}
            <p className="mt-5 text-center text-xs text-slate-500">
              {t('termsPrefix')}{' '}
              <Link href="/terms" className="hover:underline">
                {t('terms')}
              </Link>{' '}
              {t('and')}{' '}
              <Link href="/privacy" className="hover:underline">
                {t('privacy')}
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
