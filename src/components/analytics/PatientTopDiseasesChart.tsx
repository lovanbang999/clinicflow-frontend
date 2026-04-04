'use client';

import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { usePatientTopDiseases } from '@/lib/hooks/usePatientAnalytics';

const COLORS = ['#1570EF', '#0EA5E9', '#06B6D4', '#14B8A6', '#10B981'];

export function PatientTopDiseasesChart() {
  const t = useTranslations('patientOverview');
  const { data, isLoading } = usePatientTopDiseases();

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="mb-4">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t('topDiseases')}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('topDiseasesDesc')}</p>
      </div>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center">
          <p className="text-sm text-slate-400">{t('noData')}</p>
        </div>
      ) : (
        <ChartContainer 
          config={{
            occurrences: {
              label: t('occurrences'),
            }
          }} 
          className="w-full"
          style={{ height: Math.max(data.length * 40, 120) + 'px' }}
        >
          <BarChart
            layout="vertical"
            data={data}
            barSize={14}
            margin={{ top: 0, right: 36, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={130}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fill: '#64748b' }} name={t('occurrences')}>
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
