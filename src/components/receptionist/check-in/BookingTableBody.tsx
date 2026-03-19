'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { Booking } from '@/types';
import { StatusBadge } from './StatusBadge';
import { BookingActions } from './BookingActions';
import { CalendarBlankIcon } from '@phosphor-icons/react';

interface BookingRowProps {
  booking: Booking;
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export function BookingRow({ booking, onConfirm, onCancel }: BookingRowProps) {
  // Generate avatar initials from full name
  const initials = (booking.patientProfile?.fullName ?? '??')
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      {/* Booking ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-semibold text-slate-900">
          #{booking.bookingCode ?? booking.id.slice(0, 6).toUpperCase()}
        </p>
      </td>

      {/* Patient */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1570EF]/10 text-[#1570EF] flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {initials}
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-slate-900">{booking.patientProfile?.fullName}</p>
            <p className="text-xs text-slate-500">ID: {booking.patientProfile?.patientCode}</p>
          </div>
        </div>
      </td>

      {/* Doctor */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-slate-700">{booking.doctor?.fullName}</p>
          <p className="text-xs text-slate-400">{booking.service?.name}</p>
        </div>
      </td>

      {/* Service */}
      <td className="px-6 py-4">
        <p className="text-sm text-slate-600">{booking.service?.name}</p>
      </td>

      {/* Time */}
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-semibold text-slate-900">{booking.startTime}</p>
        <p className="text-[11px] text-slate-500">
          {format(new Date(booking.bookingDate), 'MMM dd, yyyy')}
        </p>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge status={booking.status} />
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right whitespace-nowrap">
        <BookingActions booking={booking} onConfirm={onConfirm} onCancel={onCancel} />
      </td>
    </tr>
  );
}

interface BookingTableBodyProps {
  bookings: Booking[];
  onConfirm: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

export function BookingTableBody({ bookings, onConfirm, onCancel }: BookingTableBodyProps) {
  const t = useTranslations('dashboard.receptionist.checkInManagement.table');

  if (bookings.length === 0) {
    return (
      <tr>
        <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
          <div className="flex flex-col items-center justify-center gap-2">
            <CalendarBlankIcon size={32} className="text-slate-300" />
            <p>{t('noData')}</p>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {bookings.map((booking) => (
        <BookingRow
          key={booking.id}
          booking={booking}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ))}
    </>
  );
}
