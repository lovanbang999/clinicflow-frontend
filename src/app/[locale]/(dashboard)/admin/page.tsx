'use client';

import { useTranslations } from 'next-intl';
import {
  useAdminStats,
  useAdminTopDoctors,
  useAdminTopServices,
} from '@/lib/hooks/useAdminDashboard';
import { AdminKpiCard, TrendUpBadge, TrendDownBadge, StableBadge } from '@/components/dashboard/AdminKpiCard';
import { UsersIcon, CalendarCheckIcon, CurrencyCircleDollarIcon } from '@phosphor-icons/react';
import { AdminRevenueTrendChart } from '@/components/dashboard/AdminRevenueTrendChart';
import { AdminTopDoctors } from '@/components/dashboard/AdminTopDoctors';
import { AdminTopServices } from '@/components/dashboard/AdminTopServices';
import { AdminRecentActivity } from '@/components/dashboard/AdminRecentActivity';

export default function AdminDashboardPage() {
  const t = useTranslations('dashboard.admin');

  // Each section loads its own data independently
  const { data: stats, loading: statsLoading } = useAdminStats();
  const { data: topDoctors, loading: topDoctorsLoading } = useAdminTopDoctors();
  const { data: topServices, loading: topServicesLoading } = useAdminTopServices();

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);
  const fmtRev = (n: number) =>
    `${new Intl.NumberFormat('vi-VN').format(Math.floor(n / 1_000_000))}M ₫`;

  // Helper: compute growth % badge for KPI cards
  const growthBadge = (current: number, last: number) => {
    if (last === 0) return <StableBadge />;
    const pct = Math.round(((current - last) / last) * 100);
    if (pct > 0) return <TrendUpBadge value={`${pct}%`} />;
    if (pct < 0) return <TrendDownBadge value={`${Math.abs(pct)}%`} />;
    return <StableBadge />;
  };

  // KPI Cards
  const kpis = stats
    ? [
      {
        icon: UsersIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-[#1392ec]',
        title: t('kpi.totalPatients'),
        value: fmt(stats.newPatients.value),
        badge: growthBadge(stats.newPatients.value + stats.newPatients.value * (stats.newPatients.trend / 100), stats.newPatients.value), // Approximation for UI based on trend
        sub: t('kpi.thisMonth', { count: stats.newPatients.value }),
      },
      {
        icon: CalendarCheckIcon,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        title: t('kpi.totalBookings'),
        value: fmt(stats.appointments.value),
        badge: growthBadge(stats.appointments.value + stats.appointments.value * (stats.appointments.trend / 100), stats.appointments.value),
        sub: t('kpi.today', { count: stats.appointments.value }),
      },
      {
        icon: CurrencyCircleDollarIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        title: t('kpi.monthlyRevenue'),
        value: fmtRev(stats.revenue.value),
        badge: growthBadge(stats.revenue.value + stats.revenue.value * (stats.revenue.trend / 100), stats.revenue.value),
        sub: t('kpi.todayOnly'),
      },
    ]
    : [];

  // If ALL sections are loading, show a full-page skeleton
  const allLoading = statsLoading && topDoctorsLoading && topServicesLoading;

  if (allLoading) {
    return (
      <div className="p-6 space-y-5">
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-32" />
          ))}
        </div>

        {/* Row 2: Revenue Chart + Booking Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-80" />
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-80" />
        </div>

        {/* Row 3: Admin Monthly Stats + Top Doctors + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-85" />
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-85" />
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-85" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-28" />
          ))
          : kpis.map((k) => <AdminKpiCard key={k.title} {...k} />)
        }
      </div>

      {/* Row 2: Revenue Chart (Full width) */}
      <div className="grid grid-cols-1 gap-5">
        {/* Revenue chart fetches its own data internally */}
        <AdminRevenueTrendChart />
      </div>

      {/* Row 3: Top Doctors + Top Services + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {topDoctorsLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-64" />
        ) : (
          <AdminTopDoctors doctors={topDoctors} />
        )}

        {topServicesLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-64" />
        ) : (
          <AdminTopServices services={topServices} />
        )}

        <AdminRecentActivity />
      </div>
    </div>
  );
}
