'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { bookingsApi } from '@/lib/api/bookings';
import { billingApi, InvoiceStatus } from '@/lib/api/billing';
import { BookingStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import {
  CalendarCheckIcon,
  CreditCardIcon,
  ReceiptIcon,
  HourglassIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';

type ActivityItem = {
  id: string;
  type: 'booking' | 'invoice';
  date: Date;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
};

export function RecentActivityList() {
  const t = useTranslations('dashboard.patient');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const [bookingsData, invoicesData] = await Promise.all([
          bookingsApi.getMyBookings(),
          billingApi.listMyInvoices({ limit: 10 })
        ]);

        const bookings = Array.isArray(bookingsData) ? bookingsData : [];
        const invoices = invoicesData?.invoices || [];

        const bookingItems: ActivityItem[] = bookings.map(b => ({
          id: `booking-${b.id}`,
          type: 'booking',
          date: new Date(b.createdAt),
          title: b.status === BookingStatus.CONFIRMED ? t('activity.bookingConfirmed') : t('activity.bookingWait'),
          description: t('activity.bookingDesc', { 
            service: b.service?.name || t('defaults.serviceName'), 
            doctor: b.doctor?.fullName || t('defaults.doctorName') 
          }),
          icon: b.status === BookingStatus.CONFIRMED ? <CalendarCheckIcon weight="fill" className="text-2xl" /> : <HourglassIcon weight="fill" className="text-2xl" />,
          iconBg: b.status === BookingStatus.CONFIRMED ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-amber-100 dark:bg-amber-500/20',
          iconColor: b.status === BookingStatus.CONFIRMED ? 'text-blue-500' : 'text-amber-500',
        }));

        const formatMoney = (amount: number) =>
          new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
            style: 'currency',
            currency: locale === 'vi' ? 'VND' : 'USD',
          }).format(amount);

        const invoiceItems: ActivityItem[] = invoices.map(inv => ({
          id: `invoice-${inv.id}`,
          type: 'invoice',
          date: new Date(inv.updatedAt || inv.createdAt),
          title: inv.status === InvoiceStatus.PAID ? t('activity.invoicePaid') : t('activity.invoiceIssued'),
          description: t('activity.invoiceDesc', { invoiceNumber: inv.invoiceNumber, amount: formatMoney(inv.totalAmount) }),
          icon: inv.status === InvoiceStatus.PAID ? <CreditCardIcon weight="fill" className="text-2xl" /> : <ReceiptIcon weight="fill" className="text-2xl" />,
          iconBg: inv.status === InvoiceStatus.PAID ? 'bg-green-100 dark:bg-green-500/20' : 'bg-red-100 dark:bg-red-500/20',
          iconColor: inv.status === InvoiceStatus.PAID ? 'text-green-600' : 'text-red-500',
        }));

        const merged = [...bookingItems, ...invoiceItems].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
        
        setActivities(merged);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivity();
  }, [t, locale]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{t('activity.title')}</h3>
        <Link href="/patient/history" className="text-blue-500 text-sm font-semibold hover:underline cursor-pointer">{t('activity.seeAll')}</Link>
      </div>
      
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            <div className="flex gap-4 items-center"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>
            <div className="flex gap-4 items-center"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>
            <div className="flex gap-4 items-center"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 font-medium">
            {t('activity.empty')}
          </div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="flex gap-4 group">
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${item.iconBg} ${item.iconColor} transition-transform group-hover:scale-110`}>
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white leading-tight mb-1">{item.title}</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 capitalize">
                  {formatDistanceToNow(item.date, { addSuffix: true, locale: dateLocale })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
