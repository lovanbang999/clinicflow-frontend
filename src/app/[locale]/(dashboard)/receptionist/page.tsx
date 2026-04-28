'use client';

import { useTranslations, useLocale } from 'next-intl';
import { OverviewCards } from '@/components/receptionist/dashboard/OverviewCards';
import { SearchCheckIn } from '@/components/receptionist/dashboard/SearchCheckIn';
import { LiveQueue } from '@/components/receptionist/dashboard/LiveQueue';
import { UpcomingAppointments } from '@/components/receptionist/dashboard/UpcomingAppointments';

export default function ReceptionistDashboardPage() {
  const t = useTranslations('receptionistOverview');
  const locale = useLocale();
  
  // Format the current date. For production, consider using a date library
  // and ensuring it matches the locale.
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
  const formattedDate = today.toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-GB', dateOptions);

  return (
    <div className="p-8 space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-slate-900">
          {t('greetingTitle', { date: formattedDate })}
        </h2>
        <p className="text-slate-500 mt-1">{t('overview')}</p>
      </section>

      <OverviewCards />
      
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <SearchCheckIn />
        <LiveQueue />
      </section>

      <UpcomingAppointments />
    </div>
  );
}
