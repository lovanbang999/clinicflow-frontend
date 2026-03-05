'use client';

import { useTranslations } from 'next-intl';
import { BookingOverviewData } from '@/types/dashboard';

interface AdminBookingOverviewProps {
  data: BookingOverviewData;
}

export function AdminBookingOverview({ data }: AdminBookingOverviewProps) {
  const t = useTranslations('dashboard.admin.bookingOverview');

  const rows = [
    {
      labelKey: 'completed',
      count: data.completed,
      pct: data.completedPct,
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-500',
      text: 'text-emerald-600',
    },
    {
      labelKey: 'upcoming',
      count: data.upcoming,
      pct: data.upcomingPct,
      dot: 'bg-[#1392ec]',
      bar: 'bg-[#1392ec]',
      text: 'text-[#1392ec]',
    },
    {
      labelKey: 'cancelled',
      count: data.cancelled,
      pct: data.cancelledPct,
      dot: 'bg-rose-400',
      bar: 'bg-rose-400',
      text: 'text-rose-500',
    },
  ] as const;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm flex flex-col">
      <h3 className="text-base font-bold text-[#111518] mb-1">{t('title')}</h3>
      <p className="text-[#94a3b8] text-xs font-medium mb-5">{t('subtitle')}</p>

      {/* Stacked bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-px mb-6">
        {rows.map((r) => (
          <div key={r.labelKey} className={r.bar} style={{ width: `${r.pct}%` }} />
        ))}
      </div>

      <div className="space-y-3 flex-1">
        {rows.map((r) => (
          <div key={r.labelKey} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`size-2 rounded-full ${r.dot} inline-block`} />
              <span className="text-sm text-[#64748b] font-medium">{t(r.labelKey)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-bold ${r.text}`}>{r.count.toLocaleString()}</span>
              <span className="text-[11px] text-[#cbd5e1] font-bold w-7 text-right">{r.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-[#f1f5f9] flex justify-between items-center">
        <span className="text-xs text-[#94a3b8] font-semibold uppercase tracking-wider">{t('total')}</span>
        <span className="text-xl font-bold text-[#111518]">{data.total.toLocaleString()}</span>
      </div>
    </div>
  );
}
