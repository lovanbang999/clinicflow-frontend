'use client';

import { useTranslations } from 'next-intl';
import {
  UsersThreeIcon,
  UserPlusIcon,
  CalendarCheckIcon,
} from '@phosphor-icons/react';
import { ReceptionistPatientStats } from '@/lib/api/users';

type StatsCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
};

function StatsCard({ label, value, icon, iconBg }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#64748b] text-sm font-medium">{label}</span>
        <div className={`size-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-[#111518]">{value}</h3>
    </div>
  );
}

type PatientStatsCardsProps = {
  stats: ReceptionistPatientStats | null;
  loading: boolean;
};

export function PatientStatsCards({ stats, loading }: PatientStatsCardsProps) {
  const t = useTranslations('receptionistPatients');

  const fmt = (n?: number | null) =>
    n != null ? new Intl.NumberFormat('en-US').format(n) : '--';

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-slate-200 rounded w-32" />
              <div className="size-10 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-8 bg-slate-200 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: t('stats.totalPatients'),
      value: fmt(stats?.totalPatients),
      iconBg: 'bg-[#1392ec]/10 text-[#1392ec]',
      icon: <UsersThreeIcon size={22} weight="fill" />,
    },
    {
      label: t('stats.newToday'),
      value: fmt(stats?.newToday),
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: <UserPlusIcon size={22} weight="fill" />,
    },
    {
      label: t('stats.activeAppointments'),
      value: fmt(stats?.activeAppointments),
      iconBg: 'bg-amber-50 text-amber-600',
      icon: <CalendarCheckIcon size={22} weight="fill" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <StatsCard key={card.label} {...card} />
      ))}
    </div>
  );
}
