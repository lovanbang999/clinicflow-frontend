'use client';

import { useTranslations } from 'next-intl';
import { 
  CalendarCheckIcon, 
  UserCheckIcon, 
  HourglassIcon, 
  ListNumbersIcon 
} from '@phosphor-icons/react';

export function OverviewCards() {
  const t = useTranslations('dashboard.receptionist.stats');

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <CalendarCheckIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">28</p>
          <p className="text-sm font-medium text-slate-400">{t('totalAppointments')}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
          <UserCheckIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">12</p>
          <p className="text-sm font-medium text-slate-400">{t('checkedIn')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
          <HourglassIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">8</p>
          <p className="text-sm font-medium text-slate-400">{t('waiting')}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-md transition-shadow">
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
          <ListNumbersIcon className="h-6 w-6" weight="fill" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">5</p>
          <p className="text-sm font-medium text-slate-400">{t('inQueue')}</p>
        </div>
      </div>
    </section>
  );
}
