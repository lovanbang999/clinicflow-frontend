'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Booking } from '@/types';
import { useBookings } from '@/lib/hooks/useBookings';
import { useRouter } from '@/i18n/navigation';
import { PlusIcon } from '@phosphor-icons/react';
import { BookingCard } from '@/components/booking/patient/BookingCard';
import {
  BookingFilterTabs,
  FilterTab,
  filterByTab,
  computeCounts,
} from '@/components/booking/patient/BookingFilterTabs';
import { BookingEmptyState } from '@/components/booking/patient/BookingEmptyState';
import { BookingLoadingSkeleton } from '@/components/booking/patient/BookingLoadingSkeleton';
import { BookingCancelDialog } from '@/components/booking/patient/BookingCancelDialog';

export default function BookingsPage() {
  const t = useTranslations('booking');
  const router = useRouter();
  const { bookings, isLoading, fetchMyBookings, cancelBooking } = useBookings();

  const [activeTab, setActiveTab]         = useState<FilterTab>('upcoming');
  const [cancellingId, setCancellingId]   = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel]   = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredBookings: Booking[] = filterByTab(bookings, activeTab);
  const counts = computeCounts(bookings);

  const handleCancelRequest = (id: string) => {
    setBookingToCancel(id);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingToCancel) return;
    try {
      setCancellingId(bookingToCancel);
      const success = await cancelBooking(bookingToCancel, reason);
      if (success) await fetchMyBookings();
    } finally {
      setCancellingId(null);
      setShowCancelDialog(false);
      setBookingToCancel(null);
    }
  };

  const handleCloseDialog = () => {
    if (cancellingId) return;
    setShowCancelDialog(false);
    setBookingToCancel(null);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/patient/bookings/${id}`);
  };

  return (
    <div className="min-h-full">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Page Header */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 font-medium">{t('pageGreeting')}</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{t('myAppointments')}</h1>
          </div>
          <button
            onClick={() => router.push('/patient/book')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1570EF] hover:bg-[#0F5ED4] text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-sm shrink-0 mb-0.5"
            aria-label={t('bookNewAppointment')}
          >
            <PlusIcon size={16} weight="bold" />
            <span className="hidden md:inline">{t('bookNewAppointment')}</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <BookingFilterTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Booking List */}
        {isLoading ? (
          <BookingLoadingSkeleton />
        ) : filteredBookings.length === 0 ? (
          <BookingEmptyState activeTab={activeTab} />
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                isCancelling={cancellingId === booking.id}
                onCancel={handleCancelRequest}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Dialog */}
      <BookingCancelDialog
        isOpen={showCancelDialog}
        isSubmitting={!!cancellingId}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
