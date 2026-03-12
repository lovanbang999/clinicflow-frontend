'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { CalendarPlusIcon, HandWavingIcon } from '@phosphor-icons/react';

export function PatientWelcomeBanner() {
  const t = useTranslations('dashboard.patient');
  const { user } = useAuthStore();

  return (
    <section className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] dark:from-[#1E293B] dark:to-[#0F172A] rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-100 dark:border-slate-800">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          {user?.fullName ? t('welcome', { name: user.fullName }) : t('welcomeDefault')}
          <HandWavingIcon weight="fill" className="text-4xl text-yellow-500" />
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          How are you feeling today? You have a checkup coming up.
        </p>
      </div>
      <Link 
        href="/patient/book" 
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
      >
        <CalendarPlusIcon weight="fill" className="text-xl" />
        Book New Appointment
      </Link>
    </section>
  );
}
