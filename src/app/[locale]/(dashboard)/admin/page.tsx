'use client';

import { useTranslations } from 'next-intl';
import {
  useAdminOverview,
  useAdminMonthlyStats,
  useAdminTopDoctors,
  useAdminBookingOverview,
} from '@/lib/hooks/useAdminDashboard';
import { AdminKpiCard, TrendUpBadge, TrendDownBadge, StableBadge } from '@/components/dashboard/AdminKpiCard';
import { Users as UsersIcon, Stethoscope as StethoscopeIcon, CalendarCheck as CalendarCheckIcon, CurrencyCircleDollar as CurrencyCircleDollarIcon } from '@phosphor-icons/react';
import { AdminRevenueTrendChart } from '@/components/dashboard/AdminRevenueTrendChart';
import { AdminBookingOverview } from '@/components/dashboard/AdminBookingOverview';
import { AdminMonthlyStats } from '@/components/dashboard/AdminMonthlyStats';
import { AdminTopDoctors } from '@/components/dashboard/AdminTopDoctors';
import { AdminRecentActivity } from '@/components/dashboard/AdminRecentActivity';

export default function AdminDashboardPage() {
  const t = useTranslations('dashboard.admin');

  // Each section loads its own data independently
  const { data: overview, loading: overviewLoading } = useAdminOverview();
  const { data: monthlyStats, loading: monthlyLoading } = useAdminMonthlyStats();
  const { data: topDoctors, loading: topDoctorsLoading } = useAdminTopDoctors(5);
  const { data: bookingOv, loading: bookingOverviewLoading } = useAdminBookingOverview();

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
  const kpis = overview
    ? [
      {
        icon: UsersIcon,
        iconBg: 'bg-blue-50',
        iconColor: 'text-[#1392ec]',
        title: t('kpi.totalPatients'),
        value: fmt(overview.totalUsers),
        badge: overview.trends
          ? growthBadge(
            overview.trends.newPatientsThisMonth,
            overview.trends.newPatientsLastMonth,
          )
          : <StableBadge />,
        sub: t('kpi.thisMonth', {
          count: overview.trends?.newPatientsThisMonth ?? 0,
        }),
      },
      {
        icon: StethoscopeIcon,
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        title: t('kpi.activeDoctors'),
        value: fmt(overview.totalDoctors),
        badge: <StableBadge />,
        sub: t('kpi.allSpecialistsActive'),
      },
      {
        icon: CalendarCheckIcon,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
        title: t('kpi.totalBookings'),
        value: fmt(overview.totalBookings),
        badge: overview.trends
          ? growthBadge(
            overview.trends.newBookingsThisMonth,
            overview.trends.newBookingsLastMonth,
          )
          : <StableBadge />,
        sub: t('kpi.upcoming', {
          count: overview.trends?.newBookingsThisMonth ?? 0,
        }),
      },
      {
        icon: CurrencyCircleDollarIcon,
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        title: t('kpi.monthlyRevenue'),
        value: fmtRev(overview.totalRevenue),
        badge: overview.trends
          ? growthBadge(
            overview.trends.currentMonthRevenue,
            overview.trends.lastMonthRevenue,
          )
          : <StableBadge />,
        sub: t('kpi.vsLastMonth'),
      },
    ]
    : [];

  // If ALL sections are loading, show a full-page skeleton
  const allLoading =
    overviewLoading && monthlyLoading && topDoctorsLoading && bookingOverviewLoading;

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-28" />
          ))
          : kpis.map((k) => <AdminKpiCard key={k.title} {...k} />)
        }
      </div>

      {/* Row 2: Revenue Chart (2/3) + Booking Overview (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue chart fetches its own data internally */}
        <AdminRevenueTrendChart />

        {bookingOverviewLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse" />
        ) : bookingOv ? (
          <AdminBookingOverview data={bookingOv} />
        ) : null}
      </div>

      {/* Row 3: Monthly Stats + Top Doctors + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {monthlyLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-64" />
        ) : monthlyStats ? (
          <AdminMonthlyStats {...monthlyStats} />
        ) : null}

        {topDoctorsLoading ? (
          <div className="bg-white rounded-2xl p-6 border border-[#e5e7eb] animate-pulse h-64" />
        ) : (
          <AdminTopDoctors doctors={topDoctors} />
        )}

        <AdminRecentActivity />
      </div>
    </div>
  );
}
