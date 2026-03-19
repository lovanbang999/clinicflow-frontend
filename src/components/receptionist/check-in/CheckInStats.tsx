'use client';

import { useTranslations } from 'next-intl';
import { TrendUpIcon, TrendDownIcon } from '@phosphor-icons/react';

interface StatCardProps {
  label: string;
  value: number;
  trend?: number;
  trendDir?: 'up' | 'down' | 'neutral';
}

function StatCard({ label, value, trend, trendDir = 'neutral' }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1">
      <p className="text-slate-500 text-sm font-medium">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-900 leading-none">{value}</span>
        {trend !== undefined && trendDir !== 'neutral' && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center mb-0.5 ${
            trendDir === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
          }`}>
            {trendDir === 'up' ? <TrendUpIcon size={14} className="mr-0.5" /> : <TrendDownIcon size={14} className="mr-0.5" />}
            {trend}%
          </span>
        )}
        {trendDir === 'neutral' && (
          <span className="text-slate-400 text-xs font-bold bg-slate-50 px-1.5 py-0.5 rounded mb-0.5">0%</span>
        )}
      </div>
    </div>
  );
}

interface CheckInStatsProps {
  pending?: number;
  confirmed?: number;
  completed?: number;
  cancelled?: number;
}

export function CheckInStats({ pending = 0, confirmed = 0, completed = 0, cancelled = 0 }: CheckInStatsProps) {
  const t = useTranslations('dashboard.receptionist.checkInManagement.stats');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard label={t('pending')} value={pending} trend={2} trendDir="up" />
      <StatCard label={t('confirmed')} value={confirmed} trend={5} trendDir="up" />
      <StatCard label={t('completed')} value={completed} trend={1} trendDir="down" />
      <StatCard label={t('cancelled')} value={cancelled} trendDir="neutral" />
    </div>
  );
}
