'use client';

import { useTranslations } from 'next-intl';
import {
  CalendarCheckIcon,
  CheckCircleIcon,
  HourglassIcon,
  ChartBarIcon,
} from '@phosphor-icons/react';

interface PatientStatsGridProps {
  upcoming: number;
  completed: number;
  waiting: number;
  total: number;
}

export function PatientStatsGrid({ upcoming, completed, waiting, total }: PatientStatsGridProps) {
  const t = useTranslations('dashboard.patient');

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
          <CalendarCheckIcon weight="fill" className="text-2xl" />
        </div>
        <div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{upcoming ? upcoming.toString().padStart(2, '0') : '0'}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('upcomingVisits')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
        <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
          <CheckCircleIcon weight="fill" className="text-2xl" />
        </div>
        <div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{completed ? completed.toString().padStart(2, '0') : '0'}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('completed')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
          <HourglassIcon weight="fill" className="text-2xl" />
        </div>
        <div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{waiting ? waiting.toString().padStart(2, '0') : '0'}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('queue')}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
          <ChartBarIcon weight="fill" className="text-2xl" />
        </div>
        <div>
          <p className="text-4xl font-extrabold text-slate-900 dark:text-white">{total ? total.toString().padStart(2, '0') : '0'}</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('totalVisits')}</p>
        </div>
      </div>
    </section>
  );
}
