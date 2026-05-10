'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useBookings } from '@/lib/hooks/appointment/useBookings';
import { useRouter } from '@/i18n/navigation';
import { PlusIcon } from '@phosphor-icons/react';
import { BookingCard } from '@/components/booking/patient/BookingCard';
import { BookingFilterTabs, FilterTab } from '@/components/booking/patient/BookingFilterTabs';
import { BookingEmptyState } from '@/components/booking/patient/BookingEmptyState';
import { BookingLoadingSkeleton } from '@/components/booking/patient/BookingLoadingSkeleton';
import { BookingCancelDialog } from '@/components/booking/patient/BookingCancelDialog';

export default function BookingsPage() {
  const t = useTranslations('booking');
  const router = useRouter();
  const { bookings, pagination, isLoading, fetchMyBookings, cancelBooking } = useBookings();

  const hour = new Date().getHours();
  let greetingKey = 'pageGreetingMorning';
  if (hour >= 12 && hour < 18) greetingKey = 'pageGreetingAfternoon';
  else if (hour >= 18 || hour < 5) greetingKey = 'pageGreetingEvening';

  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBookings({ status: activeTab, page: currentPage, limit: itemsPerPage });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage]);

  const totalPages = pagination?.totalPages || 1;
  const currentBookings = bookings;
  
  // Use pagination total for current tab, 0 for others to prevent misleading counts
  const counts = { all: 0, upcoming: 0, completed: 0, cancelled: 0 } as Record<FilterTab, number>;
  if (pagination) counts[activeTab] = pagination.total;

  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

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
    router.push(`/patient/my-bookings/${id}`);
  };

  return (
    <div className="min-h-full">
      <div className="max-w-3xl mx-auto p-2 space-y-5">
        {/* Page Header */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t(greetingKey)}</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{t('myAppointments')}</h1>
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
          onTabChange={handleTabChange}
          counts={counts}
        />

        {/* Booking List */}
        {isLoading ? (
          <BookingLoadingSkeleton />
        ) : currentBookings.length === 0 ? (
          <BookingEmptyState activeTab={activeTab} />
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {currentBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  isCancelling={cancellingId === booking.id}
                  onCancel={handleCancelRequest}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent disabled:border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                >
                  {t('pagination.previous')}
                </button>
                <span className="text-sm font-medium text-slate-500">
                  {t('pagination.page')} {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-transparent disabled:border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
                >
                  {t('pagination.next')}
                </button>
              </div>
            )}
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
