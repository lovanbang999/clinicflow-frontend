'use client';

import { StatCard } from '@/components/dashboard/StatCard';
import { NextAppointmentCard } from '@/components/dashboard/NextAppointmentCard';
import { Calendar, CheckCircle, Clock, BarChart3, Plus } from 'lucide-react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useAuthStore } from '@/lib/store/authStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PatientDashboardPage() {
  const { data, isLoading } = useDashboard();
  const { user } = useAuthStore();

  // Format current date
  const today = format(new Date(), 'EEEE, dd MMMM, yyyy', { locale: vi });

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Chào mừng, {user?.fullName || 'Bệnh nhân'}!
          </h1>
          <p className="mt-2 capitalize text-slate-600">{today}</p>
        </div>

        {/* Quick Book Button */}
        <Link href="/patient/book">
          <Button className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Đặt lịch mới
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Calendar}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          title="Lịch hẹn sắp tới"
          value={data?.stats.upcomingBookings || 0}
          loading={isLoading}
        />
        <StatCard
          icon={CheckCircle}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          title="Đã hoàn thành"
          value={data?.stats.completedBookings || 0}
          loading={isLoading}
        />
        <StatCard
          icon={Clock}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          title="Hàng đợi"
          value={data?.stats.waitingBookings || 0}
          loading={isLoading}
        />
        <StatCard
          icon={BarChart3}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          title="Tổng lượt khám"
          value={data?.stats.totalBookings || 0}
          loading={isLoading}
        />
      </div>

      {/* Next Appointment Section */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-900">
          <Calendar className="h-5 w-5 text-blue-600" />
          Lịch hẹn sắp tới
        </h2>

        <NextAppointmentCard booking={data?.nextBooking || null} loading={isLoading} />
      </div>
    </div>
  );
}
