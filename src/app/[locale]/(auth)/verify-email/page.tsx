'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { MailCheck, ArrowLeft, RefreshCw } from 'lucide-react';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from '@/i18n/navigation';

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60; // seconds

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const t = useTranslations('auth.verify');
  const tCommon = useTranslations('common');

  const { verifyEmail, resendVerification, isLoading } = useAuth();

  // OTP digits state
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Resend countdown
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start countdown on mount
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect to login after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => router.push('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const focusNext = (index: number) => {
    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusPrev = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    // Accept only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    if (digit) {
      focusNext(index);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else {
        focusPrev(index);
      }
    } else if (e.key === 'ArrowLeft') {
      focusPrev(index);
    } else if (e.key === 'ArrowRight') {
      focusNext(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setError('');

    // Focus last filled or next empty
    const nextEmpty = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[nextEmpty]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length < OTP_LENGTH) {
      setError(t('incompleteOtp'));
      return;
    }

    try {
      await verifyEmail(email, otpCode);
      setSuccess(true);
    } catch {
      // Error toast shown in useAuth
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = useCallback(async () => {
    if (!canResend || resending) return;
    try {
      setResending(true);
      await resendVerification(email);
      setCountdown(RESEND_COUNTDOWN);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch {
      // Error toast already shown in useAuth
    } finally {
      setResending(false);
    }
  }, [canResend, resending, email, resendVerification]);

  const otpFilled = otp.every((d) => d !== '');

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-50 to-white">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Back to login */}
      <div className="absolute top-4 left-4 z-10">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {tCommon('backToLogin')}
        </button>
      </div>

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur supports-backdrop-filter:bg-white/70">
          <CardHeader className="space-y-4 text-center pb-4">
            {/* Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-100">
              <MailCheck className="h-7 w-7 text-blue-600" />
            </div>

            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {t('title')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('subtitle')}
              </CardDescription>
              {email && (
                <p className="mt-1 text-sm font-medium text-slate-800 break-all">
                  {email}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {success ? (
              /* ── Success state ── */
              <div className="flex flex-col items-center gap-3 py-6 text-center animate-in fade-in duration-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <MailCheck className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-lg font-semibold text-slate-800">{t('success')}</p>
                <p className="text-sm text-slate-500">{t('successDescription')}</p>
                <p className="text-xs text-slate-400">{t('redirectingToLogin')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* OTP Boxes */}
                <div className="space-y-2">
                  <div
                    className="flex justify-center gap-2 sm:gap-3"
                    onPaste={handlePaste}
                  >
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={isLoading}
                        autoComplete="one-time-code"
                        className={[
                          'h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 text-center text-lg font-semibold',
                          'bg-white text-slate-800 outline-none transition-all duration-200',
                          'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25',
                          digit ? 'border-blue-400 bg-blue-50' : 'border-slate-200',
                          error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/25' : '',
                          isLoading ? 'opacity-50 cursor-not-allowed' : '',
                        ].join(' ')}
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-center text-sm text-red-500 animate-in fade-in duration-200">
                      {error}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading || !otpFilled}
                  className="h-11 w-full rounded-xl bg-blue-600 text-base font-medium shadow-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner />
                      {t('verifying')}
                    </span>
                  ) : (
                    t('verifyButton')
                  )}
                </Button>

                {/* Resend */}
                <div className="flex flex-col items-center gap-1 text-sm text-slate-500">
                  <span>{t('noCode')}</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="flex items-center gap-1.5 font-semibold text-blue-700 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {resending ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          {t('resendingOtp')}
                        </>
                      ) : (
                        t('resendOtp')
                      )}
                    </button>
                  ) : (
                    <span className="text-slate-400">
                      {t('resendIn', { seconds: countdown })}
                    </span>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
