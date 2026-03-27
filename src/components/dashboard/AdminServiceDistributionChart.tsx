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
  const t = useTranslations('dashboard.adminAnalytics');

  const data = services.map(s => ({
    name: s.name,
    value: s.estimatedRevenue,
    count: s.bookingsCount
  }));

  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">{t('charts.serviceDistribution')}</CardTitle>
          <CardDescription className="text-xs">{t('charts.serviceDistributionDesc')}</CardDescription>
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

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">{t('charts.serviceDistribution')}</CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          {t('charts.serviceDistributionDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full mt-2">
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
