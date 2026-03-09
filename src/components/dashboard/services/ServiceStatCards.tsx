'use client';

import { useTranslations } from 'next-intl';
import {
  ArchiveIcon,
  TrendUpIcon,
  CheckCircleIcon,
  CalendarPlusIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// Mirror of the backend ServiceStatsResponseDto
interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  newThisMonth: number;
  mostBooked: { id: string; name: string; bookingCount: number } | null;
}

function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e5e7eb] shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="size-10 rounded-lg bg-[#f1f5f9]" />
        <div className="h-5 w-12 rounded-full bg-[#f1f5f9]" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-[#f1f5f9]" />
        <div className="h-7 w-14 rounded bg-[#e5e7eb]" />
      </div>
    </div>
  );
}

type Props = {
  stats?: ServiceStats | null;
  isLoading?: boolean;
};

export function ServiceStatCards({ stats, isLoading }: Props) {
  const t = useTranslations('dashboard.serviceManagement.stats');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const activePct =
    stats && stats.totalServices > 0
      ? Math.round((stats.activeServices / stats.totalServices) * 100)
      : 0;

  const cards = [
    {
      label: t('totalServices'),
      value: stats ? String(stats.totalServices) : '—',
      icon: ArchiveIcon,
      bg: 'bg-blue-50 text-[#1392ec]',
      badge: null,
    },
    {
      label: t('mostBooked'),
      value: stats?.mostBooked?.name ?? '—',
      icon: TrendUpIcon,
      bg: 'bg-emerald-50 text-emerald-600',
      badge: stats?.mostBooked ? (
        <span className="flex items-center gap-1 text-[#078838] bg-[#078838]/10 px-2 py-0.5 rounded-full text-xs font-bold">
          {t('topBadge')}
        </span>
      ) : null,
    },
    {
      label: t('activeServices'),
      value: stats ? String(stats.activeServices) : '—',
      icon: CheckCircleIcon,
      bg: 'bg-purple-50 text-purple-600',
      badge: stats && stats.totalServices > 0 ? (
        <span className="flex items-center gap-1 text-[#078838] bg-[#078838]/10 px-2 py-0.5 rounded-full text-xs font-bold">
          {activePct}%
        </span>
      ) : null,
    },
    {
      label: t('categories'),
      value: stats ? String(stats.newThisMonth) : '—',
      icon: CalendarPlusIcon,
      bg: 'bg-amber-50 text-amber-600',
      badge: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb] flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className={cn('size-10 rounded-lg flex items-center justify-center', card.bg)}>
                <Icon size={22} weight="fill" />
              </div>
              {card.badge}
            </div>
            <div className="mt-4">
              <p className="text-[#64748b] text-sm font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-[#111518] mt-1 truncate">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
