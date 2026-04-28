'use client';

import { useTranslations } from 'next-intl';
import { UsersIcon, UserPlusIcon, WifiHighIcon, ProhibitIcon } from '@phosphor-icons/react';
import { AdminUserStats as AdminUserStatsType } from '@/types';

interface AdminUserStatsProps {
  stats: AdminUserStatsType | null;
  loadingStats: boolean;
}

export function AdminUserStats({ stats, loadingStats }: AdminUserStatsProps) {
  const t = useTranslations('adminUsers');

  const statCards = [
    {
      label: t('stats.totalUsers'),
      value: loadingStats ? '...' : (stats?.totalUsers || 0).toLocaleString(),
      icon: UsersIcon,
      iconBg: 'bg-blue-50 text-[#1392ec]',
      badge: { text: t('stats.now'), variant: 'neutral' as const },
    },
    {
      label: t('stats.newToday'),
      value: loadingStats ? '...' : '---',
      icon: UserPlusIcon,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: { text: t('stats.now'), variant: 'neutral' as const },
    },
    {
      label: t('stats.activeNow'),
      value: loadingStats ? '...' : (stats?.activeUsers || 0).toLocaleString(),
      icon: WifiHighIcon,
      iconBg: 'bg-indigo-50 text-indigo-600',
      badge: { text: t('stats.now'), variant: 'neutral' as const },
    },
    {
      label: t('stats.suspended'),
      value: loadingStats ? '...' : (stats?.inactiveUsers || 0).toLocaleString(),
      icon: ProhibitIcon,
      iconBg: 'bg-red-50 text-red-600',
      badge: { text: t('stats.alert'), variant: 'alert' as const },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div
                className={`size-10 rounded-lg flex items-center justify-center ${card.iconBg}`}
              >
                <Icon size={22} weight="fill" />
              </div>
              {card.badge.variant === 'neutral' && (
                <span className="text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded-full text-xs font-bold">
                  {card.badge.text}
                </span>
              )}
              {card.badge.variant === 'alert' && (
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-bold">
                  {card.badge.text}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-[#64748b] text-sm font-medium">{card.label}</p>
              <h3 className="text-2xl font-bold text-[#111518] mt-1">{card.value}</h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
