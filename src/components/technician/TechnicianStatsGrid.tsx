'use client';

import { useTranslations } from 'next-intl';
import { useTechnicianStats } from '@/lib/hooks/clinical/useLabOrders';
import { HourglassHighIcon, SpinnerGapIcon, CheckCircleIcon } from '@phosphor-icons/react';

export function TechnicianStatsGrid() {
  const t = useTranslations('technicianWorklist.stats');
  const { stats, isLoading } = useTechnicianStats(true); // auto Refresh

  const cards = [
    {
      label: t('pending'),
      value: stats?.pending || 0,
      icon: HourglassHighIcon,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      label: t('inProgress'),
      value: stats?.inProgress || 0,
      icon: SpinnerGapIcon,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: t('completedToday'),
      value: stats?.completedToday || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 shadow-sm animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 duration-200 cursor-pointer">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.color}`}>
              <Icon size={28} weight="fill" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
