'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useBookings } from '@/lib/hooks/useBookings';
import { Booking } from '@/types';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import {
  ClockIcon,
  UserIcon,
  StethoscopeIcon,
  CalendarBlankIcon,
  NoteIcon,
  ChatsIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';

function HistoryCard({ booking, locale }: { booking: Booking; locale: string }) {
  const t = useTranslations('dashboard.patient.labels');
  const tHistory = useTranslations('dashboard.patient.medicalHistory');
  const dateLocale = locale === 'vi' ? vi : undefined;
  const bookingDate = new Date(booking.bookingDate);
  const formattedDate = isValid(bookingDate)
    ? format(bookingDate, 'dd/MM/yyyy', { locale: dateLocale })
    : '—';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm sm:p-5 p-4 space-y-4 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#1392ec]/10 rounded-xl flex items-center justify-center shrink-0">
            <StethoscopeIcon size={18} className="text-[#1392ec]" weight="duotone" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{booking.service?.name ?? '—'}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1 sm:mt-0.5">
              <div className="flex items-center gap-1">
                <CalendarBlankIcon size={12} />
                <span>{formattedDate}</span>
              </div>
              <span className="hidden sm:inline">·</span>
              <div className="flex items-center gap-1">
                <ClockIcon size={12} />
                <span>
                  {booking.startTime ? (
                    `${booking.startTime} – ${booking.endTime}`
                  ) : (
                    t('waitingQueue')
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          {tHistory('completed')}
        </span>
      </div>

      {/* Doctor */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/50 pt-3">
        <UserIcon size={14} className="text-slate-400" />
        <span className="font-medium">{tHistory('doctorLabel')}</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{booking.doctor?.fullName ?? '—'}</span>
      </div>

      {/* Patient Notes */}
      {booking.patientNotes && (
        <div className="flex gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-sm">
          <NoteIcon size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="text-slate-600 dark:text-slate-400 text-xs italic">
            &quot;{booking.patientNotes}&quot;
          </p>
        </div>
      )}

      {/* Doctor Notes */}
      {booking.doctorNotes && (
        <div className="flex gap-2 bg-blue-50 dark:bg-blue-500/5 rounded-xl p-3">
          <ChatsIcon size={14} className="text-[#1392ec] mt-0.5 shrink-0" />
          <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed font-medium">
            {booking.doctorNotes}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PatientMedicalHistoryPage() {
  const t = useTranslations('dashboard.patient.medicalHistory');
  const tGreeting = useTranslations('booking');
  const locale = useLocale();
  const { bookings, isLoading, fetchMyBookings } = useBookings();

  useEffect(() => {
    fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:py-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-xs sm:text-sm text-[#1392ec] font-bold uppercase tracking-wider">{tGreeting('pageGreeting')}</p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{t('title')}</h1>
        <p className="text-sm text-slate font-medium">
          {completedBookings.length > 0
            ? t('subtitle', { count: completedBookings.length })
            : t('noHistory')}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <Skeleton className="h-10 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-md" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : completedBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm px-6">
          <div className="size-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <StethoscopeIcon size={40} className="text-slate-300 dark:text-slate-600" weight="duotone" />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t('emptyTitle')}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed mx-auto">{t('emptyDesc')}</p>
          </div>
        </div>
      ) : (
        <div className="relative sm:pl-8 pl-6 space-y-6">
          {/* Timeline line - Responsive centering */}
          <div className="absolute top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800 rounded-full sm:left-[15px] left-[11px]" />
          {completedBookings.map((booking) => (
            <div key={booking.id} className="relative group">
              {/* Timeline dot - Responsive centering */}
              <div 
                className="absolute top-6 size-3 rounded-full bg-[#1392ec] border-2 border-white dark:border-slate-900 shadow-[0_0_0_4px_rgba(19,146,236,0.1)] z-10 sm:-left-[22px] -left-[18px] transition-transform group-hover:scale-125" 
              />
              <HistoryCard booking={booking} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
