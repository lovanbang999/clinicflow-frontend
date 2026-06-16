'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface AdminRevenueByTypeChartProps {
  revenueByType?: {
    CONSULTATION: number;
    SERVICE: number;
    PHARMACY: number;
  };
  loading?: boolean;
}

const COLORS = ['#1392ec', '#38bdf8', '#10b981']; // Cấm màu tím, dùng màu blue, light-blue, emerald

export function AdminRevenueByTypeChart({ revenueByType, loading }: AdminRevenueByTypeChartProps) {
  const t = useTranslations('adminAnalytics');

  const rawData = React.useMemo(() => {
    if (!revenueByType) return [];
    return [
      { key: 'CONSULTATION', labelKey: 'typeConsultation', value: revenueByType.CONSULTATION },
      { key: 'SERVICE', labelKey: 'typeService', value: revenueByType.SERVICE },
      { key: 'PHARMACY', labelKey: 'typePharmacy', value: revenueByType.PHARMACY },
    ].filter(item => item.value > 0);
  }, [revenueByType]);

  const data = rawData.map(item => ({
    name: t(`charts.${item.labelKey}` as Parameters<typeof t>[0]),
    value: item.value,
  }));

  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full min-w-0">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('charts.revenueByType')}</CardTitle>
          <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400">
            {t('charts.revenueByTypeDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="size-32 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin" />
            <div className="h-4 w-32 bg-slate-100 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">{t('charts.revenueByType')}</CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {t('charts.revenueByTypeDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] pb-10">
          <div className="flex flex-col items-center gap-4">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="opacity-80"
            >
              <circle cx="60" cy="60" r="50" fill="#F0F9FF" />
              <path
                d="M60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100C82.0914 100 100 82.0914 100 60C100 37.9086 82.0914 20 60 20ZM60 30C76.5685 30 90 43.4315 90 60C90 76.5685 76.5685 90 60 90C43.4315 90 30 76.5685 30 60C30 43.4315 43.4315 30 60 30Z"
                fill="#E0F2FE"
              />
              <circle cx="60" cy="60" r="4" fill="#7DD3FC" />
            </svg>
            <div className="text-center px-6">
              <h3 className="text-sm font-bold text-slate-700 mb-1">
                {t('charts.emptyTitle')}
              </h3>
              <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                {t('charts.emptySubtitle')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = data.reduce((acc, d, idx) => {
    acc[`type_${idx}`] = { label: d.name, color: COLORS[idx % COLORS.length] };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">{t('charts.revenueByType')}</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {t('charts.revenueByTypeDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="h-[280px] w-full mt-2 min-w-0">
          <ChartContainer config={chartConfig} className="w-full h-[280px]">
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => `${Number(value).toLocaleString('vi-VN')} ₫`}
                    hideLabel
                  />
                }
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
