'use client';

import { Booking, BookingStatus } from '@/types';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Stethoscope, XCircle, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

interface BookingListItemProps {
  booking: Booking;
  onCancel?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  isLoading?: boolean;
}

export function BookingListItem({ 
  booking, 
  onCancel, 
  onViewDetails,
  isLoading = false
}: BookingListItemProps) {
  const t = useTranslations('booking');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const getStatusLabel = (status: BookingStatus) => {
    const statusMap: Record<BookingStatus, string> = {
      [BookingStatus.PENDING]: t('pending'),
      [BookingStatus.CONFIRMED]: t('confirmed'),
      [BookingStatus.CHECKED_IN]: t('checkedIn'),
      [BookingStatus.IN_PROGRESS]: t('inProgress'),
      [BookingStatus.COMPLETED]: t('completed'),
      [BookingStatus.CANCELLED]: t('cancelled'),
      [BookingStatus.QUEUED]: t('queued'),
      [BookingStatus.NO_SHOW]: t('noShow'),
    };
    return statusMap[status];
  };

  const canCancel = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status);

  const formattedDate = format(new Date(booking.bookingDate), 'dd/MM/yyyy', { locale: dateLocale });
  const formattedTime = `${booking.startTime} - ${booking.endTime}`;

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                {booking.id}
              </span>
              <StatusBadge status={booking.status} label={getStatusLabel(booking.status)} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              {booking.service?.name || 'N/A'}
            </h3>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <User className="h-4 w-4 text-gray-400" />
            <span>{booking.doctor?.fullName || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>{formattedTime}</span>
          </div>
          {booking.queueRecord && (
            <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              {t('queuePosition')}: #{booking.queueRecord.queuePosition}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails?.(booking.id)}
            className="flex-1 cursor-pointer"
            disabled={isLoading}
          >
            {t('viewDetails')}
          </Button>
          {canCancel && (
            <Button
              size="sm"
              variant="destructive"
              className="cursor-pointer"
              onClick={() => onCancel?.(booking.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Layout - Table Row Style */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
        {/* Booking ID */}
        <div className="col-span-2">
          <span className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
            {booking.id}
          </span>
        </div>

        {/* Service */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-blue-600 shrink-0" />
            <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
              {booking.service?.name || 'N/A'}
            </span>
          </div>
        </div>

        {/* Doctor */}
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {booking.doctor?.fullName || 'N/A'}
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="col-span-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="col-span-2">
          <div className="flex flex-col gap-1">
            <StatusBadge status={booking.status} label={getStatusLabel(booking.status)} />
            {booking.queueRecord && (
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                {t('queuePosition')} #{booking.queueRecord.queuePosition}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="col-span-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onViewDetails?.(booking.id)}
            disabled={isLoading}
          >
            {t('viewDetails')}
          </Button>
          {canCancel && (
            <Button
              size="icon-sm"
              variant="destructive"
              className="cursor-pointer"
              onClick={() => onCancel?.(booking.id)}
              title={t('cancelBooking')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
