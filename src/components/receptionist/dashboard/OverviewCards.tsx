'use client';

import { useTranslations } from 'next-intl';
import { 
  CalendarCheckIcon, 
  UserCheckIcon, 
  HourglassIcon, 
  CheckCircleIcon 
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceptionistDashboard } from '@/lib/hooks/useReceptionistDashboard';

export function OverviewCards() {
  const t = useTranslations('dashboard.receptionist.stats');
  const { stats, loadingStats, queueRecords } = useReceptionistDashboard();

  if (loadingStats && !stats) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </section>
    );
  }

  const totalToday = (stats?.pending?.value ?? 0) + 
                     (stats?.confirmed?.value ?? 0) + 
                     (stats?.completed?.value ?? 0) + 
                     (stats?.cancelled?.value ?? 0);

  const waitingCheckIn = stats?.confirmed?.value ?? 0;
  const completedToday = stats?.completed?.value ?? 0;
  const inQueueCount = queueRecords.length;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Appointments */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <CalendarCheckIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{totalToday}</p>
          <p className="text-sm font-medium text-slate-400">{t('totalAppointments')}</p>
        </div>
      </div>
      
      {/* Waiting for Check-in (Confirmed) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <HourglassIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{waitingCheckIn}</p>
          <p className="text-sm font-medium text-slate-400">{t('waiting')}</p>
        </div>
      </div>

      {/* In Queue / Checked In */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <UserCheckIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{inQueueCount}</p>
          <p className="text-sm font-medium text-slate-400">{t('inQueue')}</p>
        </div>
      </div>

      {/* Completed */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <CheckCircleIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{completedToday}</p>
          <p className="text-sm font-medium text-slate-400">{t('completed')}</p>
        </div>
      </div>
    </section>
  );
}
