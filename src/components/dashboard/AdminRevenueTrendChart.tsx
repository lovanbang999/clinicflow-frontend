'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminRevenueChart } from '@/lib/hooks/useAdminDashboard';

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: '#1392ec',
  },
} satisfies ChartConfig;

// Format "YYYY-MM-01" -> "Jan", "Feb", etc.
function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short' });
}

export function AdminRevenueTrendChart() {
  const [range, setRange] = useState<'6m' | 'ytd'>('6m');
  const t = useTranslations('dashboard.admin.chart');

  const months = range === '6m' ? 6 : new Date().getMonth() + 1;
  const { data, loading } = useAdminRevenueChart(months);

  const chartData = (data?.chart ?? []).map((point) => ({
    month: formatMonth(point.date),
    revenue: point.revenue,
  }));

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-bold text-[#111518]">{t('revenueTrend')}</h3>
          <p className="text-[#94a3b8] text-xs font-medium mt-0.5">{t('clinicalEarnings')}</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as '6m' | 'ytd')}>
          <SelectTrigger
            size="sm"
            className="w-[140px] text-xs font-semibold text-[#64748b] border-[#e5e7eb] bg-[#f8fafc] rounded-lg"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="6m">{t('last6Months')}</SelectItem>
            <SelectItem value="ytd">{t('yearToDate')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <div className="size-6 border-2 border-[#1392ec] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1392ec" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1392ec" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="#f1f5f9"
              strokeDasharray="0"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#cbd5e1', fontWeight: 600 }}
              dy={6}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#cbd5e1', fontWeight: 600 }}
              tickFormatter={(v: number) =>
                v >= 1_000_000
                  ? `${(v / 1_000_000).toFixed(1)}M`
                  : v >= 1000
                  ? `${(v / 1000).toFixed(0)}K`
                  : `${v}`
              }
              width={48}
            />

            <ChartTooltip
              cursor={{ stroke: '#1392ec', strokeWidth: 1, strokeDasharray: '4 2' }}
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    `${Number(value).toLocaleString('vi-VN')} ₫`
                  }
                  labelClassName="font-semibold text-[#111518]"
                />
              }
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1392ec"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{
                r: 5,
                fill: '#1392ec',
                stroke: 'white',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      )}
    </div>
  );
}
