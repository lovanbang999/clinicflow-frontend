'use client';

import { useDashboard } from '@/lib/hooks/useDashboard';
import { PatientWelcomeBanner } from '@/components/patient/PatientWelcomeBanner';
import { PatientStatsGrid } from '@/components/patient/PatientStatsGrid';
import { NextAppointmentCard } from '@/components/patient/NextAppointmentCard';
import { RecentActivityList } from '@/components/patient/RecentActivityList';
import { QuickActionBar } from '@/components/patient/QuickActionBar';
import { RecentInvoicesWidget } from '@/components/dashboard/patient/RecentInvoicesWidget';
import { PatientVisitTrendChart } from '@/components/analytics/PatientVisitTrendChart';
import { PatientTopDiseasesChart } from '@/components/analytics/PatientTopDiseasesChart';
import { PatientSpendingCard } from '@/components/analytics/PatientSpendingCard';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function PatientDashboardPage() {
  const { data } = useDashboard();

  return (
    <div className="space-y-6 md:space-y-10 pb-10">
      <PatientWelcomeBanner />
      
      <QuickActionBar />

      <PatientStatsGrid />

      {/* Analytics: Visit Trend + Top Diseases + Spending */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PatientVisitTrendChart />
        </div>
        <PatientSpendingCard />
      </section>

      <PatientTopDiseasesChart />

      <NextAppointmentCard nextBooking={data?.nextBooking} />

      {/* Two columns: Recent Activity & Recent Invoices */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivityList />
        <RecentInvoicesWidget />
      </section>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}
