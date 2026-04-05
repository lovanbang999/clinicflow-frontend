'use client';

import { useTranslations } from 'next-intl';
import {
  UsersThreeIcon,
  CheckCircleIcon,
  IslandIcon,
  UserPlusIcon,
  type Icon,
} from '@phosphor-icons/react';
import { type DoctorStatsResponse } from '@/lib/api/admin-doctors';

// Types
type BadgeVariant = 'positive' | 'neutral' | 'highlight';

type StatCard = {
  label: string;
  value: string | number;
  icon: Icon;
  iconBg: string;
  badge: { text: string; variant: BadgeVariant };
};

const BADGE_STYLES: Record<BadgeVariant, string> = {
  positive: 'text-emerald-700 bg-emerald-50',
  neutral:  'text-[#64748b] bg-[#f1f5f9]',
  highlight: 'text-[#1392ec] bg-[#1392ec]/10',
};

// Skeleton card
function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb] flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-start">
        <div className="size-10 rounded-lg bg-[#f1f5f9]" />
        <div className="h-5 w-16 rounded-full bg-[#f1f5f9]" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-24 rounded bg-[#f1f5f9]" />
        <div className="h-7 w-14 rounded bg-[#e5e7eb]" />
      </div>
    </div>
  );
}

// Props
type Props = {
  stats?: DoctorStatsResponse | null;
  isLoading?: boolean;
};

// Component
export function DoctorStatCards({ stats, isLoading }: Props) {
  const t = useTranslations('adminDoctors');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  const cards: StatCard[] = [
    {
      label: t('stats.totalDoctors'),
      value: stats?.totalDoctors ?? '—',
      icon: UsersThreeIcon,
      iconBg: 'bg-blue-50 text-[#1392ec]',
      badge: {
        text: stats?.newThisMonth != null ? `+${stats.newThisMonth}` : '—',
        variant: 'positive',
      },
    },
    {
      label: t('stats.activeNow'),
      value: stats?.activeDoctors ?? '—',
      icon: CheckCircleIcon,
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: { text: t('stats.stable'), variant: 'neutral' },
    },
    {
      label: t('stats.onLeave'),
      // onLeaveDoctors may not exist in older API; fall back to 0
      value: (stats as (DoctorStatsResponse & { onLeaveDoctors?: number }) | undefined)?.onLeaveDoctors ?? 0,
      icon: IslandIcon,
      iconBg: 'bg-orange-50 text-orange-600',
      badge: { text: t('stats.scheduled'), variant: 'neutral' },
    },
    {
      label: t('stats.newApplications'),
      value: stats?.newThisMonth ?? '—',
      icon: UserPlusIcon,
      iconBg: 'bg-purple-50 text-purple-600',
      badge: { text: t('stats.new'), variant: 'highlight' },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const IconComp = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white p-6 rounded-2xl shadow-sm border border-[#e5e7eb] flex flex-col justify-between transition-shadow hover:shadow-md"
          >
            <div className="flex justify-between items-start">
              <div className={`size-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <IconComp size={22} weight="fill" />
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${BADGE_STYLES[card.badge.variant]}`}
              >
                {card.badge.text}
              </span>
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
