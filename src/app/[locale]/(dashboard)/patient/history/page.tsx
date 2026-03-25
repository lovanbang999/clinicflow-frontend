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
  const dateLocale = locale === 'vi' ? vi : undefined;
  const bookingDate = new Date(booking.bookingDate);
  const formattedDate = isValid(bookingDate)
    ? format(bookingDate, 'dd/MM/yyyy', { locale: dateLocale })
    : '—';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-[#1392ec]/10 rounded-xl flex items-center justify-center shrink-0">
            <StethoscopeIcon size={18} className="text-[#1392ec]" weight="duotone" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm">{booking.service?.name ?? '—'}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <CalendarBlankIcon size={12} />
              <span>{formattedDate}</span>
              <span>·</span>
              <ClockIcon size={12} />
              <span>{booking.startTime} – {booking.endTime}</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full shrink-0">
          Hoàn thành
        </span>
      </div>

      {/* Doctor */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <UserIcon size={14} className="text-slate-400" />
        <span>Bác sĩ:</span>
        <span className="font-semibold text-slate-800">{booking.doctor?.fullName ?? '—'}</span>
      </div>

      {/* Patient Notes */}
      {booking.patientNotes && (
        <div className="flex gap-2 bg-slate-50 rounded-xl p-3 text-sm">
          <NoteIcon size={14} className="text-slate-400 mt-0.5 shrink-0" />
          <p className="text-slate-600 text-xs">{booking.patientNotes}</p>
        </div>
      )}

      {/* Doctor Notes */}
      {booking.doctorNotes && (
        <div className="flex gap-2 bg-blue-50 rounded-xl p-3">
          <ChatsIcon size={14} className="text-[#1392ec] mt-0.5 shrink-0" />
          <p className="text-slate-700 text-xs leading-relaxed">{booking.doctorNotes}</p>
        </div>
      )}
    </div>
  );
}

export default function PatientMedicalHistoryPage() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const { bookings, isLoading, fetchMyBookings } = useBookings();

  useEffect(() => {
    fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-500 font-medium">{t('pageGreeting')}</p>
        <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Lịch sử khám bệnh</h1>
        <p className="text-sm text-slate-400 mt-1">
          {completedBookings.length > 0
            ? `${completedBookings.length} lần khám đã hoàn thành`
            : 'Chưa có lịch sử khám bệnh'}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : completedBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <StethoscopeIcon size={32} className="text-slate-300" weight="duotone" />
          </div>
          <div>
            <p className="font-semibold text-slate-600">Chưa có lịch sử khám</p>
            <p className="text-sm text-slate-400 mt-1">Lịch sử sẽ xuất hiện sau khi bạn hoàn thành lịch hẹn</p>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 space-y-4">
          {/* Timeline line */}
          <div className="absolute left-2.5 top-5 bottom-5 w-0.5 bg-slate-200 rounded-full" />
          {completedBookings.map((booking) => (
            <div key={booking.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-6 top-5 size-3 rounded-full bg-[#1392ec] border-2 border-white shadow-sm" />
              <HistoryCard booking={booking} locale={locale} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
