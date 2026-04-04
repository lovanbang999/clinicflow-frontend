'use client';

import { useTranslations } from 'next-intl';
import { usePatientTotalSpending } from '@/lib/hooks/usePatientAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyCircleDollarIcon } from '@phosphor-icons/react';

const fmtVND = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₫`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K ₫`;
  return `${n} ₫`;
};

export function PatientSpendingCard() {
  const t = useTranslations('patientOverview');
  const { data, isLoading } = usePatientTotalSpending();

  if (isLoading) return <Skeleton className="h-28 w-full rounded-2xl" />;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
      <div className="w-10 h-10 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
        <CurrencyCircleDollarIcon weight="fill" className="text-2xl" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {data ? fmtVND(data.thisYear) : '0 ₫'}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('spendingThisYear')}</p>
        {data && data.total > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">
            {t('spendingTotal')}: <span className="font-semibold">{fmtVND(data.total)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
