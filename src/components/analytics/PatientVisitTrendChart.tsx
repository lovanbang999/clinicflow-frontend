'use client';

import { useTranslations } from 'next-intl';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { usePatientVisitTrend } from '@/lib/hooks/usePatientAnalytics';

export function PatientVisitTrendChart() {
  const t = useTranslations('patientOverview');
  const { data, isLoading } = usePatientVisitTrend();

  // Format "2026-01" → "T1"
  const formatted = data.map((d) => ({
    month: `T${parseInt(d.month.split('-')[1], 10)}`,
    count: d.count,
  }));

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="mb-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('visitTrend')}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('visitTrendDesc')}</p>
      </div>
      {data.every((d) => d.count === 0) ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-sm text-slate-400">{t('noData')}</p>
        </div>
      ) : (
        <ChartContainer 
          config={{
            visits: {
              label: t('visits'),
              color: '#1570EF',
            }
          }} 
          className="w-full h-[160px]"
        >
          <BarChart data={formatted} barSize={16} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <ChartTooltip
              cursor={{ fill: '#f8fafc' }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-visits)" radius={[6, 6, 0, 0]} name={t('visits')} />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
