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
  const tOverview = useTranslations('patientOverview');
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5 md:space-y-1">
          <p className="text-xs sm:text-sm text-[#1392ec] font-bold uppercase tracking-wider">{t(greetingKey)}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">{t('myAppointments')}</h1>
        </div>
        <button
          onClick={() => router.push('/patient/book')}
          className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm shrink-0"
          aria-label={t('bookNewAppointment')}
        >
          <PlusIcon size={16} weight="bold" />
          <span className="hidden sm:inline">{t('bookNewAppointment')}</span>
          <span className="sm:hidden">{t('bookNewAppointmentShort')}</span>
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 md:p-5 shadow-xs space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            {tOverview('filters.statusLabel')}
          </span>
          <BookingFilterTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            counts={counts}
          />
        </div>
      </div>

      {/* Booking List Container */}
      {isLoading ? (
        <BookingLoadingSkeleton />
      ) : currentBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center shadow-xs">
          <BookingEmptyState activeTab={activeTab} />
        </div>
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
