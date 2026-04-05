'use client';

import {
  useAdminStats,
  useAdminTopDoctors,
  useAdminRevenueChart,
  useAdminTopServices,
  useAdminBookingOverview,
} from '@/lib/hooks/useAdminDashboard';
import { useTranslations } from 'next-intl';
import {
  UsersIcon,
  CalendarBlankIcon,
  CurrencyCircleDollarIcon,
  CheckCircleIcon,
  ClipboardTextIcon,
} from '@phosphor-icons/react';
import * as React from 'react';
import { AdminKpiCard, TrendUpBadge, StableBadge } from '@/components/admin/AdminKpiCard';
import { AdminRevenueTrendChart } from '@/components/admin/AdminRevenueTrendChart';
import { AdminTopDoctors } from '@/components/admin/AdminTopDoctors';
import { AdminTopServices } from '@/components/admin/AdminTopServices';
import { DateRangePicker } from '@/components/shared/DateRangePicker';
import { AdminServiceDistributionChart } from '@/components/admin/AdminServiceDistributionChart';
import { AdminAppointmentStatusChart } from '@/components/admin/AdminAppointmentStatusChart';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';

function formatVND(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B ₫`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₫`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K ₫`;
  return `${val} ₫`;
}

export default function AdminAnalyticsPage() {
  const t = useTranslations('adminAnalytics');

  // Default to current month
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Convert DateRange to Api DateRange
  const apiRange = React.useMemo(() => ({
    from: date?.from?.toISOString(),
    to: date?.to?.toISOString(),
  }), [date]);

  const { data: stats, loading: loadingStats } = useAdminStats(apiRange);
  const { data: topDoctors, loading: loadingTopDoctors } = useAdminTopDoctors(apiRange);
  const { data: topServices, loading: loadingTopServices } = useAdminTopServices(apiRange);
  const { data: bookingOverview, loading: loadingBooking } = useAdminBookingOverview(apiRange);
  const { data: revenueData, loading: loadingRevenue } = useAdminRevenueChart('month', apiRange);

  return (
    <div className="px-4 sm:px-8 py-6 space-y-6 mx-auto min-w-0 overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center">
            <ClipboardTextIcon size={20} weight="duotone" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{t('title')}</h1>
            <p className="text-xs text-slate-500 mt-0.5">{t('subtitle')}</p>
          </div>
        </div>

        <DateRangePicker date={date} setDate={setDate} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingStats ? (
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
              value={(stats?.totalUsers ?? 0).toLocaleString('vi-VN')}
              badge={<TrendUpBadge value={`+${stats?.trends.newPatientsThisMonth ?? 0}`} />}
              sub={t('kpi.doctorsCount', { count: stats?.totalDoctors ?? 0 })}
            />
            <AdminKpiCard
              icon={CalendarBlankIcon}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              title={t('kpi.totalBookings')}
              value={(stats?.totalBookings ?? 0).toLocaleString('vi-VN')}
              badge={<StableBadge />}
              sub={t('kpi.allTime')}
            />
            <AdminKpiCard
              icon={CheckCircleIcon}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              title={t('kpi.growthRate')}
              value={`${stats?.trends.revenueGrowthPct ?? 0}%`}
              badge={<TrendUpBadge value={t('kpi.revenueGrowth')} />}
              sub={t('kpi.comparedToLastMonth')}
            />
            <AdminKpiCard
              icon={CurrencyCircleDollarIcon}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              title={t('kpi.totalRevenue')}
              value={formatVND(stats?.totalRevenue ?? 0)}
              badge={<TrendUpBadge value={`+${stats?.trends.revenueGrowthPct ?? 0}%`} />}
              sub={t('kpi.thisMonth', { amount: formatVND(stats?.trends.currentMonthRevenue ?? 0) })}
            />
          </>
        )}
      </div>

      {/* Revenue Trend - Main Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 h-full min-w-0">
          <AdminRevenueTrendChart 
            data={revenueData} 
            loading={loadingRevenue} 
            isExternalRange={!!date?.from}
            chartHeight="h-full min-h-[300px]"
          />
        </div>
        
        <div className="h-full min-w-0">
          <AdminAppointmentStatusChart 
            overview={bookingOverview} 
            loading={loadingBooking} 
          />
        </div>
      </div>

      {/* Secondary Row: Service Dist + Rankings side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="min-w-0 h-full">
          <AdminServiceDistributionChart 
            services={topServices} 
            loading={loadingTopServices} 
          />
        </div>
        
        <div className="min-w-0 h-full">
          {loadingTopDoctors ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 h-full">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : (
            <AdminTopDoctors doctors={topDoctors ?? []} />
          )}
        </div>

        <div className="min-w-0 h-full">
          {loadingTopServices ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 h-full">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : (
            <AdminTopServices services={topServices ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
