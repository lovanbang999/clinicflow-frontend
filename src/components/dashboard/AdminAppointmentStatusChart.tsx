'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { useTranslations } from 'next-intl';
import { BookingOverview } from '@/lib/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface AdminAppointmentStatusChartProps {
  overview: BookingOverview | null;
  loading?: boolean;
}

export function AdminAppointmentStatusChart({ overview, loading }: AdminAppointmentStatusChartProps) {
  const t = useTranslations('adminAnalytics');

  const data = [
    { name: t('charts.statusCompleted'), value: overview?.completed ?? 0, color: '#10b981' },
    { name: t('charts.statusUpcoming'), value: overview?.upcoming ?? 0, color: '#1392ec' },
    { name: t('charts.statusCancelled'), value: overview?.cancelled ?? 0, color: '#f43f5e' },
    { name: t('charts.statusInProgress'), value: overview?.inProgress ?? 0, color: '#f59e0b' },
  ].filter(d => d.value > 0 || !overview);

  if (loading || !overview) {
    return (
      <Card className="rounded-2xl border-slate-200 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('charts.appointmentStatus')}</CardTitle>
          <CardDescription className="text-xs">{t('charts.appointmentStatusDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="size-32 rounded-full border-4 border-slate-100 animate-spin border-t-emerald-500" />
            <div className="h-4 w-32 bg-slate-100 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full flex flex-col min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">{t('charts.appointmentStatus')}</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {t('charts.appointmentStatusDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 min-w-0">
        <div className="flex-1 min-h-[280px] w-full mt-2 min-w-0">
          <ChartContainer
            config={data.reduce((acc, d, idx) => {
              acc[`seg_${idx}`] = { label: d.name, color: d.color };
              return acc;
            }, {} as ChartConfig)}
            className="w-full h-[280px]"
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
              />
            </PieChart>
          </ChartContainer>
        </div>
        
        <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">{t('charts.totalBookings')}</p>
            <p className="text-lg font-bold text-slate-900">{overview.total}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-[10px] text-emerald-600 font-bold uppercase">{t('charts.successRate')}</p>
            <p className="text-lg font-bold text-emerald-600">{overview.completedPct}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
