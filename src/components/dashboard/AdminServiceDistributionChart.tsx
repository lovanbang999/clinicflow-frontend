'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';
import { TopServiceItem } from '@/lib/api/dashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface AdminServiceDistributionChartProps {
  services: TopServiceItem[];
  loading?: boolean;
}

const COLORS = ['#1392ec', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

export function AdminServiceDistributionChart({ services, loading }: AdminServiceDistributionChartProps) {
  const t = useTranslations('adminAnalytics');

  const data = services.map(s => ({
    name: s.name,
    value: s.estimatedRevenue,
    count: s.bookingsCount
  }));

  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full min-w-0">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('charts.serviceDistribution')}</CardTitle>
          <CardDescription className="text-xs uppercase tracking-wider font-bold text-slate-400">{t('charts.serviceDistributionDesc')}</CardDescription>
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

  if (services.length === 0) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full min-w-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-900">{t('charts.serviceDistribution')}</CardTitle>
          <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {t('charts.serviceDistributionDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] pb-10">
          <div className="flex flex-col items-center gap-4">
            {/* Chart Empty Illustration */}
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
              <rect x="58" y="40" width="4" height="20" rx="2" fill="#BAE6FD" />
              <rect
                x="65"
                y="55"
                width="4"
                height="15"
                rx="2"
                transform="rotate(45 65 55)"
                fill="#BAE6FD"
              />
              <rect
                x="45"
                y="65"
                width="4"
                height="12"
                rx="2"
                transform="rotate(-45 45 65)"
                fill="#BAE6FD"
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

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">{t('charts.serviceDistribution')}</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {t('charts.serviceDistributionDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0">
        <div className="h-[280px] w-full mt-2 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(value: number) => [`${value.toLocaleString('vi-VN')} ₫`, t('charts.revenue')]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-2">
          {services.slice(0, 3).map((s, i) => (
            <div key={s.id} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 ">
                <div className="size-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-slate-600 truncate max-w-[120px] font-medium">{s.name}</span>
              </div>
              <span className="text-slate-400 font-mono">{s.bookingsCount} {t('charts.bookings')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
