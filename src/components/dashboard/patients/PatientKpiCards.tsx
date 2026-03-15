'use client';

import { useTranslations } from 'next-intl';
import {
  UsersThreeIcon,
  UserPlusIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  ArrowUpIcon,
} from '@phosphor-icons/react';

export type PatientKpiData = {
  totalPatients?: number | null;
  newThisMonth?: number | null;
  patientsToday?: number | null;
  activeAppointments?: number | null;
  totalPatientsTrend?: number | null;
  newThisMonthTrend?: number | null;
  patientsTodayTrend?: number | null;
  activeAppointmentsTrend?: number | null;
};

type KpiCardProps = {
  label: string;
  value: string;
  trend?: string | null;
  icon: React.ReactNode;
  iconBg: string;
  trendPositive?: boolean;
};

function KpiCard({ label, value, trend, icon, iconBg, trendPositive }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[#64748b] text-sm font-medium">{label}</span>
        <div className={`size-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <h3 className="text-2xl font-bold text-[#111518]">{value}</h3>
        {trend && (
          <span
            className={`text-xs font-bold mb-1 flex items-center gap-0.5 ${
              trendPositive ? 'text-emerald-500' : 'text-red-400'
            }`}
          >
            <ArrowUpIcon
              size={12}
              weight="bold"
              className={trendPositive ? '' : 'rotate-180'}
            />
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

type PatientKpiCardsProps = {
  data?: PatientKpiData | null;
  loading?: boolean;
};

export function PatientKpiCards({ data, loading }: PatientKpiCardsProps) {
  const t = useTranslations('dashboard.admin');

  const fmt = (n?: number | null) =>
    n != null ? new Intl.NumberFormat('en-US').format(n) : '--';

  const fmtTrend = (n?: number | null) => (n != null ? `${Math.abs(n)}%` : null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
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

  const cards: KpiCardProps[] = [
    {
      label: t('patientManagement.kpi.totalPatients'),
      value: fmt(data?.totalPatients),
      trend: fmtTrend(data?.totalPatientsTrend),
      trendPositive: (data?.totalPatientsTrend ?? 0) >= 0,
      iconBg: 'bg-[#1392ec]/10 text-[#1392ec]',
      icon: <UsersThreeIcon size={22} weight="fill" />,
    },
    {
      label: t('patientManagement.kpi.newThisMonth'),
      value: fmt(data?.newThisMonth),
      trend: fmtTrend(data?.newThisMonthTrend),
      trendPositive: (data?.newThisMonthTrend ?? 0) >= 0,
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: <UserPlusIcon size={22} weight="fill" />,
    },
    {
      label: t('patientManagement.kpi.patientsToday'),
      value: fmt(data?.patientsToday),
      trend: fmtTrend(data?.patientsTodayTrend),
      trendPositive: (data?.patientsTodayTrend ?? 0) >= 0,
      iconBg: 'bg-blue-50 text-blue-600',
      icon: <CalendarBlankIcon size={22} weight="fill" />,
    },
    {
      label: t('patientManagement.kpi.activeAppointments'),
      value: fmt(data?.activeAppointments),
      trend: fmtTrend(data?.activeAppointmentsTrend),
      trendPositive: (data?.activeAppointmentsTrend ?? 0) >= 0,
      iconBg: 'bg-amber-50 text-amber-600',
      icon: <CalendarCheckIcon size={22} weight="fill" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
