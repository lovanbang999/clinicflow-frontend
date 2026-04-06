'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { format, isValid } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { bookingsApi } from '@/lib/api/appointment/bookings';
import { Booking, BookingStatus } from '@/types';
import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  ClockIcon,
  UserIcon,
  StethoscopeIcon,
  HashIcon,
  CurrencyDollarIcon,
  HourglassIcon,
  NoteIcon,
  ChatsIcon,
  XCircleIcon,
  WarningIcon,
  QueueIcon,
} from '@phosphor-icons/react';
import { useBookings } from '@/lib/hooks/appointment/useBookings';

// New Decomposed Components
import { DetailHero } from '@/components/booking/patient/detail/DetailHero';
import { DetailSectionCard, DetailInfoRow } from '@/components/booking/patient/detail/DetailSection';
import { DetailSkeleton } from '@/components/booking/patient/detail/DetailSkeleton';
import { BookingCancelDialog } from '@/components/booking/patient/BookingCancelDialog';

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const { id } = use(params);

  const td = useTranslations('booking.detail');
  const router = useRouter();
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const { cancelBooking } = useBookings();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await bookingsApi.getById(id);
        setBooking(data);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleConfirmCancel = async (reason: string) => {
    if (!booking) return;
    try {
      setIsCancelling(true);
      const success = await cancelBooking(booking.id, reason);
      if (success) {
        // Refresh booking data after cancel
        const updated = await bookingsApi.getById(booking.id);
        setBooking(updated);
      }
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const canCancel = booking
    ? [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)
    : false;

  /* Loading */
  if (isLoading) return <DetailSkeleton />;

  /* Error */
  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <WarningIcon size={28} weight="fill" className="text-red-400" />
        </div>
        <p className="text-base font-semibold text-slate-700">{td('notFound')}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[#1570EF] text-white text-sm font-semibold rounded-xl cursor-pointer"
        >
          {td('backToList')}
        </button>
      </div>
    );
  }

  /* Formatted values */
  const bookingDate = new Date(booking.bookingDate);
  const createdAt = new Date(booking.createdAt);

  const formattedDate = isValid(bookingDate)
    ? format(bookingDate, 'dd MMMM yyyy', { locale: dateLocale })
    : booking.bookingDate || '—';

  const formattedCreated = isValid(createdAt)
    ? format(createdAt, 'dd/MM/yyyy · HH:mm', { locale: dateLocale })
    : '—';
    
  const timeRange = booking.startTime 
    ? `${booking.startTime} – ${booking.endTime}`
    : td('queueTitle');
  const bookingCode = booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase();
  const duration = booking.service?.durationMinutes
    ? `${booking.service.durationMinutes} ${td('minutesShort')}`
    : '—';
    
  const price = booking.service?.price != null
    ? new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: locale === 'vi' ? 'VND' : 'USD',
      maximumFractionDigits: 0,
    }).format(booking.service.price)
    : '—';

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Header Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeftIcon size={17} weight="bold" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">{td('title')}</h1>
        </div>

        {/* Hero Card */}
        <DetailHero 
          doctorName={booking.doctor?.fullName || ''}
          serviceName={booking.service?.name || ''}
          status={booking.status}
          queuePosition={booking.queueRecord?.queuePosition}
        />

        {/* Date & Time */}
        <DetailSectionCard title={td('date') + ' & ' + td('time')}>
          <DetailInfoRow icon={CalendarBlankIcon} label={td('date')} value={formattedDate} />
          <DetailInfoRow icon={ClockIcon} label={td('time')} value={timeRange} />
          <DetailInfoRow icon={HourglassIcon} label={td('duration')} value={duration} />
        </DetailSectionCard>

        {/* Service & Practitioner */}
        <DetailSectionCard title={td('service')}>
          <DetailInfoRow icon={StethoscopeIcon} label={td('service')} value={booking.service?.name ?? '—'} />
          <DetailInfoRow icon={UserIcon} label={td('doctor')} value={booking.doctor?.fullName ?? '—'} />
          <DetailInfoRow icon={CurrencyDollarIcon} label={td('price')} value={price} />
        </DetailSectionCard>

        {/* Booking Reference */}
        <DetailSectionCard title={td('bookingCode')}>
          <DetailInfoRow icon={HashIcon} label={td('bookingCode')} value={<span className="font-mono">{bookingCode}</span>} />
          <DetailInfoRow icon={CalendarBlankIcon} label={td('createdAt')} value={formattedCreated} />
        </DetailSectionCard>

        {/* Queue Information */}
        {booking.queueRecord && (
          <DetailSectionCard title={td('queueInfo')}>
            <DetailInfoRow
              icon={QueueIcon}
              label={td('queuePosition')}
              value={`#${booking.queueRecord.queuePosition}`}
            />
            <DetailInfoRow
              icon={HourglassIcon}
              label={td('estimatedWait')}
              value={`${booking.queueRecord.estimatedWaitMinutes} ${td('minutesShort')}`}
            />
          </DetailSectionCard>
        )}

        {/* Patient Notes */}
        <DetailSectionCard title={td('patientNotes')}>
          <DetailInfoRow 
            icon={NoteIcon} 
            label={td('patientNotes')} 
            value={<span className={!booking.patientNotes ? 'text-slate-400 italic font-normal' : ''}>
              {booking.patientNotes ?? td('noNotes')}
            </span>}
          />
        </DetailSectionCard>

        {/* Doctor Notes */}
        {booking.doctorNotes && (
          <DetailSectionCard title={td('doctorNotes')}>
            <DetailInfoRow 
              icon={ChatsIcon} 
              label={td('doctorNotes')} 
              value={booking.doctorNotes}
              iconColor="text-[#1570EF]"
              bgColor="bg-blue-50"
            />
          </DetailSectionCard>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="w-full py-3 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-semibold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <XCircleIcon size={18} weight="fill" />
            {td('cancelAppointment')}
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      <BookingCancelDialog
        isOpen={showCancelDialog}
        isSubmitting={isCancelling}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
