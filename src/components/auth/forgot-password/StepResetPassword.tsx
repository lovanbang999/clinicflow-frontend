'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface StepResetPasswordProps {
  email: string;
  otpCode: string;
  isLoading: boolean;
  onSuccess: () => void;
  onSubmitApi: (email: string, code: string, newPassword: string) => Promise<unknown>;
}

export function StepResetPassword({
  email,
  otpCode,
  isLoading,
  onSuccess,
  onSubmitApi,
}: StepResetPasswordProps) {
  const t = useTranslations('auth.forgotPassword');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (newPassword.length < 8) {
      setError(t('passwordTooShort'));
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError(t('passwordMismatch'));
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmitApi(email, otpCode, newPassword);
      onSuccess();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* New password */}
      <div className="space-y-2">
        <Label htmlFor="fp-new-password" className="text-sm font-medium">
          {t('newPassword')} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="fp-new-password"
            type={showNew ? 'text' : 'password'}
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
            disabled={isLoading}
            className={[
              'h-11 pr-10 bg-white focus-visible:ring-2 focus-visible:ring-blue-600/30',
              error ? 'border-red-500' : '',
            ].join(' ')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div className="space-y-2">
        <Label htmlFor="fp-confirm-password" className="text-sm font-medium">
          {t('confirmPassword')} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            id="fp-confirm-password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
            disabled={isLoading}
            className={[
              'h-11 pr-10 bg-white focus-visible:ring-2 focus-visible:ring-blue-600/30',
              error ? 'border-red-500' : '',
            ].join(' ')}
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
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
            {t('resetting')}
          </span>
        ) : (
          t('resetButton')
        )}
      </Button>
    </form>
  );
}
