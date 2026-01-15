'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BookingListItem } from '@/components/booking/BookingListItem';
import { Button } from '@/components/ui/button';
import { Booking, BookingStatus } from '@/types';
import { useBookings } from '@/lib/hooks/useBookings';
import { Plus, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function BookingsPage() {
  const t = useTranslations('booking');
  const router = useRouter();
  const { bookings, isLoading, fetchMyBookings, cancelBooking } = useBookings();
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, activeTab]);

  const filterBookings = () => {
    let filtered = [...bookings];

    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter((booking) =>
          [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.QUEUED].includes(
            booking.status
          )
        );
        break;
      case 'completed':
        filtered = filtered.filter((booking) => booking.status === BookingStatus.COMPLETED);
        break;
      case 'cancelled':
        filtered = filtered.filter((booking) =>
          [BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(booking.status)
        );
        break;
      case 'all':
      default:
        break;
    }

    setFilteredBookings(filtered);
  };

  const handleCancel = async (id: string) => {
    // Open the confirmation dialog
    setBookingToCancel(id);
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      setCancellingId(bookingToCancel);
      const success = await cancelBooking(bookingToCancel);
      if (success) {
        // Refresh the bookings list after successful cancellation
        await fetchMyBookings();
      }
    } finally {
      setCancellingId(null);
      setShowCancelDialog(false);
      setBookingToCancel(null);
    }
  };

  const handleViewDetails = (id: string) => {
    // Navigate to booking details page (to be implemented)
    console.log('View booking details:', id);
  };

  const getCounts = () => {
    return {
      all: bookings.length,
      upcoming: bookings.filter((b) =>
        [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN, BookingStatus.QUEUED].includes(
          b.status
        )
      ).length,
      completed: bookings.filter((b) => b.status === BookingStatus.COMPLETED).length,
      cancelled: bookings.filter((b) =>
        [BookingStatus.CANCELLED, BookingStatus.NO_SHOW].includes(b.status)
      ).length,
    };
  };

  const counts = getCounts();

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: t('all'), count: counts.all },
    { key: 'upcoming', label: t('upcoming'), count: counts.upcoming },
    { key: 'completed', label: t('completed'), count: counts.completed },
    { key: 'cancelled', label: t('cancelled'), count: counts.cancelled },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Calendar className="h-7 w-7 text-blue-600" />
            {t('myAppointments')}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>
        <Button
          onClick={() => router.push('/patient/book')}
          className="gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          {t('bookNewAppointment')}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors cursor-pointer',
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium',
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Desktop Table Header - Hidden on mobile */}
      <div className="hidden lg:block">
        <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            <div className="col-span-2">{t('bookingId')}</div>
            <div className="col-span-2">{t('service')}</div>
            <div className="col-span-2">{t('doctor')}</div>
            <div className="col-span-2">{t('dateTime')}</div>
            <div className="col-span-2">{t('status')}</div>
            <div className="col-span-2">{t('actions')}</div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{t('loadingBookings')}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-800">
            <Calendar className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('noBookingsFound')}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-sm">
            {t('noBookingsDescription')}
          </p>
          <Button
            onClick={() => router.push('/patient/book')}
            className="mt-6 gap-2 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t('bookNewAppointment')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <BookingListItem
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              onViewDetails={handleViewDetails}
              isLoading={cancellingId === booking.id}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <AlertDialogTitle className="text-left">
                {t('confirmCancel')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-2">
              {t('cancelWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!cancellingId} className="cursor-pointer">
              {t('back')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={!!cancellingId}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer"
            >
              {cancellingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('cancelBooking')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
