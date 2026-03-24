'use client';

import {
  useAdminOverview,
  useAdminMonthlyStats,
  useAdminTopDoctors,
  useAdminRevenueChart,
  useAdminBookingOverview,
} from '@/lib/hooks/useAdminDashboard';
import { useTranslations } from 'next-intl';
import { AdminKpiCard, TrendUpBadge, StableBadge } from '@/components/dashboard/AdminKpiCard';
import { AdminMonthlyStats } from '@/components/dashboard/AdminMonthlyStats';
import { AdminRevenueTrendChart } from '@/components/dashboard/AdminRevenueTrendChart';
import { AdminTopDoctors } from '@/components/dashboard/AdminTopDoctors';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UsersIcon,
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
} from '@phosphor-icons/react';

function formatVND(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B ₫`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₫`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K ₫`;
  return `${val} ₫`;
}

export default function AdminReportsPage() {
  const t = useTranslations('dashboard.adminAnalytics');

  const { data: overview, loading: loadingOverview } = useAdminOverview();
  const { data: monthly, loading: loadingMonthly } = useAdminMonthlyStats();
  const { data: topDoctors, loading: loadingTopDoctors } = useAdminTopDoctors(5);
  useAdminRevenueChart(6);
  const { data: bookingOverview, loading: loadingBookings } = useAdminBookingOverview();

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center">
          <ClipboardTextIcon size={20} weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingOverview ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-7 w-1/2" />
            </div>
          ))
        ) : (
          <>
            <AdminKpiCard
              icon={UsersIcon}
              iconBg="bg-blue-50"
              iconColor="text-[#1392ec]"
              title={t('kpi.totalUsers')}
              value={(overview?.totalUsers ?? 0).toLocaleString('vi-VN')}
              badge={<TrendUpBadge value="+5%" />}
              sub={t('kpi.doctorsCount', { count: overview?.totalDoctors ?? 0 })}
            />
            <AdminKpiCard
              icon={CalendarBlankIcon}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              title={t('kpi.totalBookings')}
              value={(overview?.totalBookings ?? 0).toLocaleString('vi-VN')}
              badge={<StableBadge />}
              sub={t('kpi.allTime')}
            />
            <AdminKpiCard
              icon={CheckCircleIcon}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title={t('kpi.growthRate')}
              value={`${overview?.trends?.revenueGrowthPct ?? 0}%`}
              badge={<TrendUpBadge value={t('kpi.revenueGrowth')} />}
              sub={t('kpi.comparedToLastMonth')}
            />
            <AdminKpiCard
              icon={CurrencyCircleDollarIcon}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              title={t('kpi.totalRevenue')}
              value={formatVND(overview?.totalRevenue ?? 0)}
              badge={<TrendUpBadge value="+12%" />}
              sub={t('kpi.thisMonth', { amount: formatVND(overview?.trends?.currentMonthRevenue ?? 0) })}
            />
          </>
        )}
      </div>

      {/* Booking Overview Stats */}
      {!loadingBookings && bookingOverview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t('bookingStatus.upcoming'), value: bookingOverview.upcoming ?? 0, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: t('bookingStatus.inProgress'), value: bookingOverview.inProgress ?? 0, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: t('bookingStatus.completed'), value: bookingOverview.completed ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: t('bookingStatus.cancelled'), value: bookingOverview.cancelled ?? 0, color: 'text-red-500', bg: 'bg-red-50' },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-4 ${item.bg} border border-slate-100`}>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value.toLocaleString('vi-VN')}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart + Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AdminRevenueTrendChart />
        </div>
        <div>
          {loadingMonthly ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (
            <AdminMonthlyStats
              bookingCount={monthly?.bookingCount ?? 0}
              newPatients={monthly?.newPatients ?? 0}
              successRate={monthly?.successRate ?? 0}
              revenue={monthly?.revenue ?? 0}
            />
          )}
        </div>
      </div>

      {/* Top Doctors */}
      <div>
        {loadingTopDoctors ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
          </div>
        ) : (
          <AdminTopDoctors doctors={topDoctors ?? []} />
        )}
      </div>
    </div>
  );
}
