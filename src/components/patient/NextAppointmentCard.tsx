'use client';

import { format, parse } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarBlankIcon,
  MapPinIcon,
  CalendarXIcon,
  ClockIcon,
} from '@phosphor-icons/react';
import { NextBooking } from '@/types/dashboard';

interface NextAppointmentProps {
  nextBooking: NextBooking | null | undefined;
}

export function NextAppointmentCard({ nextBooking }: NextAppointmentProps) {
  const t = useTranslations('patientOverview');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const dateTime = nextBooking?.startTime ? parse(
    nextBooking.startTime,
    'HH:mm',
    new Date()
  ) : null;

  if (!nextBooking) {
    return (
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarXIcon weight="fill" className="text-slate-400 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('noUpcomingAppointments')}</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{t('noUpcomingDescription')}</p>
        <Link href="/patient/book" className="inline-flex bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
          {t('bookCheckup')}
        </Link>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-110 transition-transform hidden md:block">
        <CalendarBlankIcon weight="fill" className="text-[128px]" />
      </div>
      <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center relative z-10">
        <div className="flex-shrink-0 flex items-center gap-4 w-full md:w-auto">
          {nextBooking.doctor.avatar ? (
            <Image src={nextBooking.doctor.avatar} alt="Doctor" width={160} height={160} className="w-20 h-20 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg ring-2 md:ring-4 ring-slate-50 dark:ring-slate-800" />
          ) : (
            <div className="w-20 h-20 md:w-40 md:h-40 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center text-3xl md:text-4xl shadow-lg ring-2 md:ring-4 ring-slate-50 dark:ring-slate-800 font-bold">
              {nextBooking.doctor.fullName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="md:hidden flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {nextBooking.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-0.5">{nextBooking.service.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('doctorPrefix')} {nextBooking.doctor.fullName}
            </p>
          </div>
        </div>

        <div className="flex-grow w-full md:w-auto">
          <div className="hidden md:flex flex-wrap items-center gap-3 mb-3">
            <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {nextBooking.status}
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">{t('nextAppointment')}</span>
          </div>

          <h2 className="hidden md:block text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">{nextBooking.service.name}</h2>
          <p className="hidden md:block text-slate-500 dark:text-slate-400 mb-6 text-lg">
            {t('withDoctor')} <span className="text-slate-900 dark:text-white font-semibold">{t('doctorPrefix')} {nextBooking.doctor.fullName}</span>
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-8 w-full">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 md:px-4 md:py-2 rounded-xl flex-1">
              <CalendarBlankIcon weight="fill" className="text-blue-500 text-xl" />
              <div>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">{t('labels.date')}</p>
                <p className="text-xs md:text-sm font-semibold">{format(new Date(nextBooking.bookingDate), 'MMM dd, yyyy', { locale: dateLocale })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 md:px-4 md:py-2 rounded-xl flex-1">
              <ClockIcon weight="fill" className="text-blue-500 text-xl" />
              <div>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">{t('labels.time')}</p>
                <p className="text-xs md:text-sm font-semibold">{dateTime ? format(dateTime, 'HH:mm') : t('labels.waitingQueue')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 md:px-4 md:py-2 rounded-xl flex-1">
              <MapPinIcon weight="fill" className="text-blue-500 text-xl" />
              <div>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-tight">{t('labels.location')}</p>
                <p className="text-xs md:text-sm font-semibold">{t('labels.generalRoom')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
          <Link href={`/patient/bookings/${nextBooking.id}`} className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-6 py-2.5 md:py-3 rounded-xl font-bold transition-colors text-center w-full flex-1">
            {t('labels.viewDetails')}
          </Link>
          <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-6 py-2.5 md:py-3 rounded-xl font-bold transition-colors text-center w-full flex-1 cursor-pointer">
            {t('labels.reschedule')}
          </button>
        </div>
      </div>
    </section>
  );
}
