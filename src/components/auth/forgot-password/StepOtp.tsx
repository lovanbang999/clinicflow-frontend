'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { OTP_LENGTH, RESEND_COUNTDOWN } from './types';

interface StepOtpProps {
  email: string;
  isLoading: boolean;
  onSuccess: (code: string) => void;
  onVerifyApi: (email: string, code: string) => Promise<unknown>;
  onResendApi: (email: string) => Promise<unknown>;
}

export function StepOtp({
  email,
  isLoading,
  onSuccess,
  onVerifyApi,
  onResendApi,
}: StepOtpProps) {
  const t = useTranslations('auth.forgotPassword');
  const tValidation = useTranslations('validation');

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');

  // Resend countdown
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first box on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Helpers
  const focusNext = (i: number) => { if (i < OTP_LENGTH - 1) inputRefs.current[i + 1]?.focus(); };
  const focusPrev = (i: number) => { if (i > 0) inputRefs.current[i - 1]?.focus(); };

  // Handlers
  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError('');
    if (digit) focusNext(index);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else {
        focusPrev(index);
      }
    } else if (e.key === 'ArrowLeft') focusPrev(index);
    else if (e.key === 'ArrowRight') focusNext(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    setError('');
    const focus = pasted.length < OTP_LENGTH ? pasted.length : OTP_LENGTH - 1;
    inputRefs.current[focus]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError(tValidation('otp'));
      return;
    }
    try {
      await onVerifyApi(email, code);
      onSuccess(code);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // error toast shown by useAuth; reset boxes
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = useCallback(async () => {
    if (!canResend || resending) return;
    try {
      setResending(true);
      await onResendApi(email);
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(RESEND_COUNTDOWN);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch {
      // toast already shown
    } finally {
      setResending(false);
    }
  }, [canResend, resending, email, onResendApi]);

  const otpFilled = otp.every((d) => d !== '');

  // Render
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* OTP Boxes */}
      <div className="space-y-3">
        <div
          className="flex justify-center gap-2 sm:gap-3"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              id={`fp-otp-${index}`}
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

      {/* Verify button */}
      <Button
        type="submit"
        disabled={isLoading || !otpFilled}
        className="h-11 w-full rounded-xl bg-blue-600 text-base font-medium shadow-sm hover:bg-blue-700 cursor-pointer disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner />
            {t('verifyingOtp')}
          </span>
        ) : (
          t('verifyOtpButton')
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
          <span className="text-slate-400">{t('resendIn', { seconds: countdown })}</span>
        )}
      </div>
    </form>
  );
}
