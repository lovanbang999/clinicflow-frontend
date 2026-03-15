'use client';

import { useDashboard } from '@/lib/hooks/useDashboard';
import { PatientWelcomeBanner } from '@/components/patient/PatientWelcomeBanner';
import { PatientStatsGrid } from '@/components/patient/PatientStatsGrid';
import { NextAppointmentCard } from '@/components/patient/NextAppointmentCard';
import { RecentActivityList } from '@/components/patient/RecentActivityList';
import { RecommendedSpecialists } from '@/components/patient/RecommendedSpecialists';

export default function PatientDashboardPage() {
  const { data } = useDashboard();

  console.log(data);

  // Derived stats from data, defaulting to 0
  const upcoming = data?.stats.upcomingBookings || 0;
  const completed = data?.stats.completedBookings || 0;
  const waiting = data?.stats.waitingBookings || 0;
  const total = data?.stats.totalBookings || 0;

  return (
    <div className="space-y-10">
      <PatientWelcomeBanner />

      <PatientStatsGrid 
        upcoming={upcoming}
        completed={completed}
        waiting={waiting}
        total={total}
      />

      <NextAppointmentCard nextBooking={data?.nextBooking} />

      {/* Two columns: Recent Activity & Specialists */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivityList />
        <RecommendedSpecialists />
      </section>
    </div>
  );
}
