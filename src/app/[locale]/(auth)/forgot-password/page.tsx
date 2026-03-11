'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, KeyRound, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/hooks/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

// Step components
import { StepEmail } from '@/components/auth/forgot-password/StepEmail';
import { StepOtp } from '@/components/auth/forgot-password/StepOtp';
import { StepResetPassword } from '@/components/auth/forgot-password/StepResetPassword';
import { StepDone } from '@/components/auth/forgot-password/StepDone';
import { StepIndicator } from '@/components/auth/forgot-password/StepIndicator';
import { type Step, STEP_INDEX } from '@/components/auth/forgot-password/types';

// Back-button shared style
const BACK_BTN_CLASS =
  'flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-sm font-medium ' +
  'text-slate-700 shadow-sm backdrop-blur hover:bg-white hover:text-slate-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-600/30 cursor-pointer';

// Page
export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = useTranslations('auth.forgotPassword');
  const tCommon = useTranslations('common');

  const { forgotPassword, verifyResetOtp, resetPassword, isLoading } = useAuth();

  // Shared state that steps need to hand off
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState(''); // captured after step 2

  const stepIndex = STEP_INDEX[step];

  // Step navigation
  const goBack = () => {
    if (step === 'otp') setStep('email');
    else if (step === 'reset') setStep('otp');
  };

  // Render
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-slate-50 to-white">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Back Button */}
      {step !== 'done' && (
        <div className="absolute top-4 left-4 z-10">
          {step === 'email' ? (
            <button type="button" onClick={() => router.push('/login')} className={BACK_BTN_CLASS}>
              <ArrowLeft className="h-4 w-4" />
              {tCommon('backToLogin')}
            </button>
          ) : (
            <button type="button" onClick={goBack} className={BACK_BTN_CLASS}>
              <ArrowLeft className="h-4 w-4" />
              {tCommon('back')}
            </button>
          )}
        </div>
      )}

      <div className="relative flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur supports-backdrop-filter:bg-white/70">

          {/* Card Header */}
          <CardHeader className="space-y-4 text-center pb-4">
            {/* Step icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 ring-4 ring-blue-100">
              {step === 'done'
                ? <CheckCircle2 className="h-7 w-7 text-green-600" />
                : step === 'otp'
                  ? <ShieldCheck className="h-7 w-7 text-blue-600" />
                  : <KeyRound className="h-7 w-7 text-blue-600" />
              }
            </div>

            {/* Step progress dots */}
            {step !== 'done' && <StepIndicator currentIndex={stepIndex} />}

            {/* Title + subtitle */}
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                {step === 'email' && t('title')}
                {step === 'otp' && t('verifyOtpTitle')}
                {step === 'reset' && t('resetTitle')}
                {step === 'done' && t('resetSuccess')}
              </CardTitle>
              <CardDescription className="text-sm">
                {step === 'email' && t('subtitle')}
                {step === 'otp' && (
                  <>{t('verifyOtpSubtitle')}{' '}
                    <span className="font-medium text-slate-700 break-all">{email}</span>
                  </>
                )}
                {step === 'reset' && t('resetSubtitle')}
                {step === 'done' && t('resetSuccessDescription')}
              </CardDescription>
            </div>
          </CardHeader>

          {/* Card Content (active step) */}
          <CardContent>
            {step === 'email' && (
              <StepEmail
                email={email}
                onChange={setEmail}
                isLoading={isLoading}
                onSubmitApi={forgotPassword}
                onSuccess={() => setStep('otp')}
              />
            )}

            {step === 'otp' && (
              <StepOtp
                email={email}
                isLoading={isLoading}
                onVerifyApi={verifyResetOtp}
                onResendApi={forgotPassword}
                onSuccess={(code) => {
                  setOtpCode(code);
                  setStep('reset');
                }}
              />
            )}

            {step === 'reset' && (
              <StepResetPassword
                email={email}
                otpCode={otpCode}
                isLoading={isLoading}
                onSubmitApi={resetPassword}
                onSuccess={() => setStep('done')}
              />
            )}

            {step === 'done' && (
              <StepDone onGoToLogin={() => router.push('/login')} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
