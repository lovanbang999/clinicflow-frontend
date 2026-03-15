'use client';

import { useTranslations } from 'next-intl';
import { CalendarBlankIcon, UserPlusIcon, CheckCircleIcon, CurrencyCircleDollarIcon } from '@phosphor-icons/react';

interface AdminMonthlyStatsProps {
  bookingCount: number;
  newPatients: number;
  successRate: number;
  revenue: number;
}

export function AdminMonthlyStats({
  bookingCount,
  newPatients,
  successRate,
  revenue,
}: AdminMonthlyStatsProps) {
  const t = useTranslations('dashboard.admin.monthlyStats');

  const items = [
    { labelKey: 'bookings', value: bookingCount.toLocaleString(), icon: CalendarBlankIcon, bg: 'bg-blue-50', color: 'text-[#1392ec]', bar: Math.min(bookingCount / 5, 100), barColor: 'bg-[#1392ec]' },
    { labelKey: 'newPatients', value: newPatients.toLocaleString(), icon: UserPlusIcon, bg: 'bg-emerald-50', color: 'text-emerald-600', bar: Math.min(newPatients / 2, 100), barColor: 'bg-emerald-500' },
    { labelKey: 'successRate', value: `${successRate}%`, icon: CheckCircleIcon, bg: 'bg-purple-50', color: 'text-purple-600', bar: successRate, barColor: 'bg-purple-500' },
    { labelKey: 'revenue', value: `${(revenue / 1_000_000).toFixed(1)}M`, icon: CurrencyCircleDollarIcon, bg: 'bg-amber-50', color: 'text-amber-600', bar: Math.min(revenue / 2_000_000, 100), barColor: 'bg-amber-400' },
  ] as const;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-base font-bold text-[#111518]">{t('title')}</h3>
          <p className="text-[#94a3b8] text-xs font-medium mt-0.5">
            {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {items.map((s) => (
          <div key={s.labelKey}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={`size-6 rounded-md ${s.bg} ${s.color} flex items-center justify-center`}>
                  <s.icon weight="fill" className="text-[14px]" />
                </div>
                <span className="text-sm text-[#64748b] font-medium">{t(s.labelKey)}</span>
              </div>
              <span className="text-sm font-bold text-[#111518]">{s.value}</span>
            </div>
            <div className="w-full h-1.5 bg-[#f1f5f9] rounded-full overflow-hidden">
              <div className={`h-full ${s.barColor} rounded-full`} style={{ width: `${s.bar}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
