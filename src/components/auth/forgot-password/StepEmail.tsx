'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { validateEmail } from '@/lib/utils/validators';

interface StepEmailProps {
  email: string;
  onChange: (email: string) => void;
  isLoading: boolean;
  onSuccess: () => void;
  onSubmitApi: (email: string) => Promise<unknown>;
}

export function StepEmail({
  email,
  onChange,
  isLoading,
  onSuccess,
  onSubmitApi,
}: StepEmailProps) {
  const t = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('validation');
  const tFields = useTranslations('validation.fields');

  const [error, setError] = useState('');

  const validate = () => {
    if (!email) {
      setError(tValidation('required', { field: tFields('email') }));
      return false;
    }
    if (!validateEmail(email)) {
      setError(tValidation('email'));
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await onSubmitApi(email);
      onSuccess();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // error toast already shown by useAuth
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="fp-email" className="text-sm font-medium">
          {t('email')} <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="fp-email"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              onChange(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
            className={[
              'h-11 pl-10 bg-white',
              'focus-visible:ring-2 focus-visible:ring-blue-600/30',
              error ? 'border-red-500 focus-visible:ring-red-500/30' : '',
            ].join(' ')}
          />
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
            {t('sending')}
          </span>
        ) : (
          t('submitButton')
        )}
      </Button>

      {/* Back to login */}
      <div className="text-center text-sm pt-2">
        <Link
          href="/login"
          className="font-medium text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToLogin')}
        </Link>
      </div>
    </form>
  );
}
