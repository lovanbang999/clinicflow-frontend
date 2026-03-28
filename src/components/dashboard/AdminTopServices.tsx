'use client';

import { useTranslations } from 'next-intl';
import { TopServiceItem } from '@/lib/api/dashboard';
import Link from 'next/link';

const SERVICE_COLORS = [
  'bg-blue-100 text-blue-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-indigo-100 text-indigo-600',
];

interface Props {
  services: TopServiceItem[];
  viewAllHref?: string;
}

function ServiceInitials({ name, colorClass }: { name: string; colorClass: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold shrink-0 ${colorClass}`}
    >
      {initials || '?'}
    </span>
  );
}

export function AdminTopServices({ services, viewAllHref = '/admin/services' }: Props) {
  const t = useTranslations('dashboard.admin.topServices');
  const safeServices = Array.isArray(services) ? services : [];

  const fmtRev = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M ₫`
      : `${new Intl.NumberFormat('vi-VN').format(n)} ₫`;

  const maxCount = Math.max(...safeServices.map((s) => s.bookingsCount), 1);

  return (
    <div className="h-full bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{t('title')}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{t('subtitle')}</p>
        </div>
        <Link href={viewAllHref} className="text-[#1392ec] text-xs font-bold hover:underline">
          {t('viewAll')}
        </Link>
      </div>

      {/* List */}
      {safeServices.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8 text-sm text-slate-400">
          {t('noData')}
        </div>
      ) : (
        <ul className="space-y-3">
          {safeServices.map((svc, idx) => {
            const colorClass = SERVICE_COLORS[idx % SERVICE_COLORS.length];
            const barPct = Math.round((svc.bookingsCount / maxCount) * 100);
            return (
              <li key={svc.id ?? idx} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-4 shrink-0 font-semibold">{idx + 1}</span>
                <ServiceInitials name={svc.name} colorClass={colorClass} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 truncate">{svc.name}</span>
                    <span className="text-xs text-slate-500 shrink-0">{svc.bookingsCount} lịch</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[200px]">
                    <div
                      className="h-full bg-[#1392ec] rounded-full transition-all duration-500"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">~{fmtRev(svc.estimatedRevenue)} dự kiến</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
