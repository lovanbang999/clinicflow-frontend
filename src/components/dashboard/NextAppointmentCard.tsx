'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User } from 'lucide-react';
import { NextBooking } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';

interface NextAppointmentCardProps {
  booking: NextBooking | null;
  loading?: boolean;
}

export function NextAppointmentCard({ booking, loading = false }: NextAppointmentCardProps) {
  if (loading) {
    return (
      <Card className="border-slate-200">
        <CardContent>
          <div className="space-y-4">
            <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!booking) {
    return (
      <Card className="border-slate-200">
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-slate-500">Bạn chưa có lịch hẹn nào</p>
            <Link href="/patient/book">
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 cursor-pointer">Đặt lịch mới</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const bookingDate = new Date(booking.bookingDate);
  const formattedDate = format(bookingDate, 'EEEE, dd/MM/yyyy', { locale: vi });

  // Generate initials from doctor name
  const initials = booking.doctor.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="border-l-4 border-l-blue-600 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Lịch hẹn sắp tới</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Service Name */}
          <div>
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              Đã xác nhận
            </span>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {booking.service.name}
            </h3>
          </div>

          {/* Doctor Info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-cyan-600 text-sm font-bold text-white">
              {booking.doctor.avatar ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}${booking.doctor.avatar}`}
                  alt={booking.doctor.fullName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="h-4 w-4" />
                <span>{booking.doctor.fullName}</span>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-2 rounded-lg bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="capitalize">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Clock className="h-4 w-4 text-slate-500" />
              <span>
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Chi tiết
            </Button>
            <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700">
              Hủy lịch
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
