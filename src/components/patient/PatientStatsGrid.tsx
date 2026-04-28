'use client';

import { useTranslations } from 'next-intl';
import { useApiData } from '@/lib/hooks/core/useApiData';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import {
  CalendarCheckIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';

export function PatientStatsGrid() {
  const t = useTranslations('patientOverview');
  const { data, isLoading } = useApiData(medicalRecordsApi.getPatientStats, null);

  if (isLoading || !data) {
    return (
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:gap-4">
            <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl" />
            <div>
              <Skeleton className="h-8 sm:h-10 w-16 mb-2" />
              <Skeleton className="h-3 sm:h-4 w-24" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  const { totalVisits, visitsThisYear, activeBookings, abnormalResults } = data;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
          <CalendarCheckIcon weight="fill" className="text-xl sm:text-2xl" />
        </div>
        <div>
          <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{activeBookings}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[12px] sm:text-sm font-medium">{t('upcomingVisits')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
          <CheckCircleIcon weight="fill" className="text-xl sm:text-2xl" />
        </div>
        <div>
          <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{visitsThisYear}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[12px] sm:text-sm font-medium">{t('visitsThisYear')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
          <WarningCircleIcon weight="fill" className="text-xl sm:text-2xl" />
        </div>
        <div>
          <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{abnormalResults}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[12px] sm:text-sm font-medium">{t('abnormalResults')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
          <ChartBarIcon weight="fill" className="text-xl sm:text-2xl" />
        </div>
        <div>
          <p className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">{totalVisits}</p>
          <p className="text-slate-500 dark:text-slate-400 text-[12px] sm:text-sm font-medium">{t('totalVisits')}</p>
        </div>
      </div>
    </section>
  );
}
