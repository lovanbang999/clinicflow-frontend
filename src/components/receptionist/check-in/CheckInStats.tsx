'use client';

import { useTranslations } from 'next-intl';
import { TrendUpIcon, TrendDownIcon } from '@phosphor-icons/react';
import { StatTrend } from '@/lib/api/appointment/bookings';

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
  pending?: StatTrend;
  confirmed?: StatTrend;
  completed?: StatTrend;
  cancelled?: StatTrend;
}

export function CheckInStats({ pending, confirmed, completed, cancelled }: CheckInStatsProps) {
  const t = useTranslations('receptionistCheckIn.stats');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label={t('pending')} 
        value={pending?.value ?? 0} 
        trend={pending?.trend} 
        trendDir={pending?.trendDir} 
      />
      <StatCard 
        label={t('confirmed')} 
        value={confirmed?.value ?? 0} 
        trend={confirmed?.trend} 
        trendDir={confirmed?.trendDir} 
      />
      <StatCard 
        label={t('completed')} 
        value={completed?.value ?? 0} 
        trend={completed?.trend} 
        trendDir={completed?.trendDir} 
      />
      <StatCard 
        label={t('cancelled')} 
        value={cancelled?.value ?? 0} 
        trend={cancelled?.trend} 
        trendDir={cancelled?.trendDir} 
      />
    </div>
  );
}
