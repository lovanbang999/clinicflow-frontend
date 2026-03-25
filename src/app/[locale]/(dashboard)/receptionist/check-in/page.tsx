'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useBookings } from '@/lib/hooks/useBookings';
import { Booking, BookingStatus } from '@/types';
import { CheckInStats } from '@/components/receptionist/check-in/CheckInStats';
import { AppointmentsTable } from '@/components/receptionist/check-in/AppointmentsTable';
import { CancelBookingModal } from '@/components/receptionist/check-in/CancelBookingModal';
import { ConfirmBookingModal } from '@/components/receptionist/check-in/ConfirmBookingModal';
import { toast } from 'sonner';
import { bookingsApi, ReceptionistStatsResponse } from '@/lib/api/bookings';
import { doctorsApi } from '@/lib/api/doctors';

interface DoctorOption {
  id: string;
  fullName: string;
}

export default function ReceptionistCheckInPage() {
  const t = useTranslations('dashboard.receptionist.checkInManagement');
  const router = useRouter();
  const { fetchBookings, cancelBooking, fetchReceptionistStats } = useBookings();

  // Table state
  const [activeTab, setActiveTab] = useState<BookingStatus | string>(BookingStatus.PENDING);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Stats state
  const [stats, setStats] = useState<ReceptionistStatsResponse | null>(null);

  // Filter state — default date is today
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);

  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Confirm modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [bookingToConfirm, setBookingToConfirm] = useState<Booking | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch doctors once on mount
  useEffect(() => {
    doctorsApi.getAll({ limit: 100 }).then((list) => {
      setDoctors(list.map((d) => ({ id: d.id, fullName: d.fullName })));
    }).catch(() => {
      // Non-critical: filter will just have no doctor options
    });
  }, []);

  const loadBookings = useCallback(async () => {
    const data = await fetchBookings({
      status: activeTab,
      page: currentPage,
      limit: 10,
      ...(selectedDate ? { date: selectedDate } : {}),
      ...(selectedDoctorId ? { doctorId: selectedDoctorId } : {}),
      ...(searchQuery ? { search: searchQuery } : {}),
    } as Parameters<typeof fetchBookings>[0]);

    if (data) {
      setBookings(data.bookings);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setTotalBookings((data.pagination as any).total || 0);
    }
  }, [activeTab, currentPage, selectedDate, selectedDoctorId, searchQuery, fetchBookings]);

  const loadStats = useCallback(async () => {
    const data = await fetchReceptionistStats();
    if (data) {
      setStats(data);
    }
  }, [fetchReceptionistStats]);

  useEffect(() => {
    // Add debounce for search query
    const timeoutId = setTimeout(() => {
      loadBookings();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [loadBookings]);
  
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Filter handlers (reset page to 1 on filter change)

  const handleStatusFilter = (status: BookingStatus | string) => {
    setActiveTab(status);
    setCurrentPage(1);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handleDoctorChange = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setCurrentPage(1);
  };

  // Cancel booking

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
        loadStats();
      }
    } finally {
      setIsCancelling(false);
    }
  };

  // Confirm booking

  const handleConfirmClick = (booking: Booking) => {
    setBookingToConfirm(booking);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingToConfirm) return;
    setIsConfirming(true);
    try {
      await bookingsApi.updateStatus(bookingToConfirm.id, { status: BookingStatus.CONFIRMED });
      toast.success(t('confirmModal.success'));
      setIsConfirmModalOpen(false);
      setBookingToConfirm(null);
      loadBookings();
      loadStats();
    } catch {
      toast.error(t('confirmModal.error'));
    } finally {
      setIsConfirming(false);
    }
  };

  // Check-in: redirect to billing page for fee collection (B1)
  // The billing page handles CONSULTATION invoice + check-in automatically
  const handleCheckInClick = (booking: Booking) => {
    router.push(`/receptionist/billing/booking/${booking.id}`);
  };

  // Fallback direct check-in used only internally (e.g., from billing page)
  const handleDirectCheckIn = async (booking: Booking) => {
    const result = await bookingsApi.checkIn(booking.id);
    if (result) {
      toast.success(
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-emerald-800">{t('checkInSuccess')}</p>
          <p className="text-sm">STT: <span className="font-bold">{result.queue?.queuePosition}</span></p>
          <p className="text-sm">{t('estimatedWait', { minutes: result.queue?.estimatedWaitMinutes })}</p>
        </div>
      );
      loadBookings();
      loadStats();
    }
  };

  void handleDirectCheckIn;

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-slate-50/50">

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto w-full p-8">
        {/* Stats */}
        <CheckInStats 
          pending={stats?.pending}
          confirmed={stats?.confirmed}
          completed={stats?.completed}
          cancelled={stats?.cancelled}
        />

        {/* Filter & Table Area */}
        <AppointmentsTable
          bookings={bookings}
          totalBookings={totalBookings}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          activeStatusTab={activeTab}
          onStatusFilter={handleStatusFilter}
          onCancelBookingClick={handleCancelClick}
          onConfirmBookingClick={handleConfirmClick}
          onCheckInClick={handleCheckInClick}
          searchQuery={searchQuery}
          onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          selectedDoctorId={selectedDoctorId}
          onDoctorChange={handleDoctorChange}
          doctors={doctors}
        />
      </div>

      {/* Cancel Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        booking={bookingToCancel}
        onClose={() => {
          setIsCancelModalOpen(false);
          setBookingToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        isSubmitting={isCancelling}
      />

      {/* Confirm Modal */}
      <ConfirmBookingModal
        isOpen={isConfirmModalOpen}
        booking={bookingToConfirm}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setBookingToConfirm(null);
        }}
        onConfirm={handleConfirmBooking}
        isSubmitting={isConfirming}
      />
    </div>
  );
}
