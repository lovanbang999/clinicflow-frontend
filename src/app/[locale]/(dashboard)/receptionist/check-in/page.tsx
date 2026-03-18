'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useBookings } from '@/lib/hooks/useBookings';
import { Booking, BookingStatus } from '@/types';
import { CheckInStats } from '@/components/receptionist/check-in/CheckInStats';
import { AppointmentsTable } from '@/components/receptionist/check-in/AppointmentsTable';
import { CancelBookingModal } from '@/components/receptionist/check-in/CancelBookingModal';
import { toast } from 'sonner';
import { bookingsApi } from '@/lib/api/bookings';

export default function ReceptionistCheckInPage() {
  const t = useTranslations('dashboard.receptionist.checkInManagement');
  const { fetchBookings, cancelBooking } = useBookings();
  
  const [activeTab, setActiveTab] = useState<BookingStatus | string>(BookingStatus.PENDING);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, currentPage]);

  const loadBookings = async () => {
    const data = await fetchBookings({
        status: activeTab,
        page: currentPage,
        limit: 10
    } as Parameters<typeof fetchBookings>[0]);

    if (data) {
        setBookings(data.bookings);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTotalBookings((data.pagination as any).total || 0);
    }
  };

  const handleStatusFilter = (status: BookingStatus | string) => {
    setActiveTab(status);
    setCurrentPage(1);
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    
    try {
        const success = await cancelBooking(bookingToCancel.id, reason);
        if (success) {
            toast.success(t('cancelModal.success'));
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
            loadBookings();
        }
    } finally {
        setIsCancelling(false);
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
     try {
         await bookingsApi.updateStatus(bookingId, { status: BookingStatus.CONFIRMED });
         toast.success('Booking confirmed successfully');
         loadBookings();
     } catch {
         toast.error('Failed to confirm booking');
     }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50/50">

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto w-full p-8">
         {/* Stats */}
         <CheckInStats />

         {/* Filter & Table Area */}
         <AppointmentsTable 
             bookings={bookings}
             totalBookings={totalBookings}
             currentPage={currentPage}
             onPageChange={setCurrentPage}
             activeStatusTab={activeTab}
             onStatusFilter={handleStatusFilter}
             onCancelBookingClick={handleCancelClick}
             onConfirmBooking={handleConfirmBooking}
         />
      </div>

      {/* Modals */}
      <CancelBookingModal 
         isOpen={isCancelModalOpen}
         onClose={() => {
             setIsCancelModalOpen(false);
             setBookingToCancel(null);
         }}
         onConfirm={handleConfirmCancel}
         isSubmitting={isCancelling}
      />
    </div>
  );
}
