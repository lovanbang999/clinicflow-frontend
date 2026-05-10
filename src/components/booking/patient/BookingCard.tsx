'use client';

import { Booking, BookingStatus } from '@/types';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { format, isToday, isValid } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import {
  CalendarBlankIcon,
  ClockIcon,
  ArrowCounterClockwiseIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import { BookingStatusBadge } from './BookingStatusBadge';

interface BookingCardProps {
  booking: Booking;
  isCancelling: boolean;
  onCancel: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const canCancel = (status: BookingStatus) =>
  [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(status);

const isCompleted = (status: BookingStatus) => status === BookingStatus.COMPLETED;

/* Generate a placeholder avatar with initials from doctor name */
function DoctorAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(-2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full bg-[#1570EF]/10 dark:bg-blue-500/20 text-[#1570EF] dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 select-none">
      {initials}
    </div>
  );
}

export function BookingCard({ booking, isCancelling, onCancel, onViewDetails }: BookingCardProps) {
  const t = useTranslations('booking');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const bookingDate = new Date(booking.bookingDate);
  const validDate = isValid(bookingDate);
  const todayDate = validDate ? isToday(bookingDate) : false;
  
  const formattedDate = !validDate
    ? (booking.bookingDate || '—')
    : todayDate
    ? t('datePicker.today')
    : format(bookingDate, 'MMM dd, yyyy', { locale: dateLocale });
  const formattedTime = booking.startTime;

  const doctorName = booking.doctor?.fullName ?? '';
  const serviceName = booking.service?.name ?? t('initialConsultation');
  const specialty   = booking.service?.name ?? t('doctor');

  const cancelable  = canCancel(booking.status);
  const done        = isCompleted(booking.status);

  // Date colour: blue for today, slate for past
  const dateTextClass = todayDate ? 'text-[#1570EF]' : 'text-slate-400';
  const DateIcon = todayDate ? ClockIcon : CalendarBlankIcon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:shadow-slate-200/40 dark:hover:shadow-slate-900/40 transition-all duration-300 overflow-hidden group">
      {/* Card Top */}
      <div className="px-4 pt-4 pb-3 space-y-2.5">
        {/* Row 1: status badge + date */}
        <div className="flex items-center justify-between gap-2">
          <BookingStatusBadge status={booking.status} />
          <span className={`flex items-center gap-1 text-xs font-medium ${dateTextClass}`}>
            <DateIcon size={13} weight="bold" />
            {formattedDate} · {formattedTime}
          </span>
        </div>

        {/* Row 2: service name */}
        <h3 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {/* Service name from API */}
          {serviceName}
        </h3>

        {/* Row 3: doctor */}
        <div className="flex items-center gap-2.5">
          {/* Doctor avatar initials placeholder since no avatar in API */}
          <DoctorAvatar name={doctorName} />
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {/* Doctor name from API */}
              {doctorName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-medium">
              {/* Specialty from API */}
              {specialty}
            </p>
          </div>
          {booking.queueRecord && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap shrink-0">
              {t('queuePosition')} #{booking.queueRecord.queuePosition}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-slate-800" />

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-2">
        {done ? (
          /* Completed card: Download Report + Rebook */
          <>
            <button
              onClick={() => onViewDetails(booking.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <DownloadSimpleIcon size={16} weight="bold" />
              {t('downloadReport')}
            </button>
            <button
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              <ArrowCounterClockwiseIcon size={15} weight="bold" />
            </button>
          </>
        ) : (
          /* Active/upcoming card: View Details + Cancel */
          <>
            <button
              onClick={() => onViewDetails(booking.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#1570EF] hover:bg-[#0F5ED4] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {t('viewDetails')}
            </button>
            {cancelable && (
              <button
                onClick={() => onCancel(booking.id)}
                disabled={isCancelling}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-1.5"
              >
                {isCancelling ? t('cancelling') : t('cancelBooking')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
