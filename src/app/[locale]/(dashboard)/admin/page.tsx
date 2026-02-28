'use client';

import { useTranslations } from 'next-intl';
import { AdminStatCard } from '@/components/dashboard/AdminStatCard';
import { MonthlyStatsCard } from '@/components/dashboard/MonthlyStatsCard';
import { TopDoctorsCard } from '@/components/dashboard/TopDoctorsCard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { useAdminDashboard } from '@/lib/hooks/useAdminDashboard';
import { Loading } from '@/components/common/Loading';

export default function AdminDashboardPage() {
  const t = useTranslations('dashboard.admin');
  const { data: dashboardData, loading } = useAdminDashboard();

  if (loading) {
    return <Loading />;
  }

  if (!dashboardData) {
    return null;
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatRevenue = (num: number) => {
    return `${Math.floor(num / 1000000)}M`;
  };

  const getCurrentDate = () => {
    const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `${dayName}, ${date}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('dashboard')}
          </h1>
        </div>
        <p className="text-sm text-gray-600 pl-14">
          {t('systemOverview')} - {getCurrentDate()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title={t('totalUsers')}
          value={formatNumber(dashboardData.stats.totalUsers)}
          icon={
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
          iconBgColor="bg-blue-100"
          valueColor="text-red-600"
        />

        <AdminStatCard
          title={t('doctors')}
          value={formatNumber(dashboardData.stats.totalDoctors)}
          icon={
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
          iconBgColor="bg-green-100"
          valueColor="text-green-600"
        />

        <AdminStatCard
          title={t('totalBookings')}
          value={formatNumber(dashboardData.stats.totalBookings)}
          icon={
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          iconBgColor="bg-orange-100"
          valueColor="text-orange-600"
        />

        <AdminStatCard
          title={t('revenue')}
          value={formatRevenue(dashboardData.stats.totalRevenue)}
          icon={
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          iconBgColor="bg-yellow-100"
          valueColor="text-yellow-600"
        />
      </div>

      {/* Monthly Stats and Top Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyStatsCard
          title={t('monthlyStats')}
          stats={dashboardData.monthlyStats}
          translations={{
            bookingCount: t('bookingCount'),
            newPatients: t('newPatients'),
            successRate: t('successRate'),
            revenue: t('monthlyRevenue'),
          }}
        />

        <TopDoctorsCard
          title={t('topDoctors')}
          doctors={dashboardData.topDoctors}
          visitsLabel={t('visits')}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart
        title={t('revenueChart')}
        data={dashboardData.revenueChart}
      />
    </div>
  );
}
