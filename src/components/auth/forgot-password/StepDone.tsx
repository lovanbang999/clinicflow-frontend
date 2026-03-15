'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface StepDoneProps {
  onGoToLogin: () => void;
}

export function StepDone({ onGoToLogin }: StepDoneProps) {
  const t = useTranslations('auth.forgotPassword');

  return (
    <div className="mt-2 space-y-4">
      <div className="flex flex-col items-center gap-3 py-4 text-center animate-in fade-in duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-sm text-slate-500">{t('resetSuccessDescription')}</p>
      </div>

      <Button
        onClick={onGoToLogin}
        className="h-11 w-full rounded-xl bg-blue-600 text-base font-medium shadow-sm hover:bg-blue-700 cursor-pointer"
      >
        {t('backToLogin')}
      </Button>
    </div>
  );
}
