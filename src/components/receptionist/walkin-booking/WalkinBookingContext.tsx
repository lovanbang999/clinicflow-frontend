'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { usersApi } from '@/lib/api/auth/users';
import { doctorsApi } from '@/lib/api/clinical/doctors';
import { bookingsApi } from '@/lib/api/appointment/bookings';
import { schedulesApi } from '@/lib/api/appointment/schedules';
import { User, Doctor, Booking } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface QueueInfo {
  queuePosition: number;
  estimatedWaitMinutes: number;
}

interface WalkinBookingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  bookingType: 'PRE_BOOKING' | 'WALK_IN';
  setBookingType: (type: 'PRE_BOOKING' | 'WALK_IN') => void;

  // Patient Selection
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  selectedPatient: User | null;
  searchResults: User[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  setPage: (page: number) => void;
  showCreateForm: boolean;
  setShowCreateForm: (show: boolean) => void;
  newPatient: { fullName: string; phone: string; email: string; gender: 'MALE' | 'FEMALE' | 'OTHER'; isGuest: boolean; address: string; dateOfBirth: string; nationalId: string; bloodType: string };
  setNewPatient: React.Dispatch<React.SetStateAction<{ fullName: string; phone: string; email: string; gender: 'MALE' | 'FEMALE' | 'OTHER'; isGuest: boolean; address: string; dateOfBirth: string; nationalId: string; bloodType: string }>>;
  isCreatingPatient: boolean;
  handleSearchPatient: (page?: number) => Promise<void>;
  handleCreatePatient: (e: React.FormEvent) => Promise<void>;
  selectPatient: (patient: User) => void;

  // Doctor Selection (Step 2 — Mô hình A: không có service step)
  doctors: Doctor[];
  isLoadingDoctors: boolean;
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doctor: Doctor | null) => void;

  // Appointment Time (Step 3)
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedSlot: string | null;
  selectSlot: (slot: string) => void;
  availableSlots: string[];
  isLoadingSlots: boolean;
  patientNotes: string;
  setPatientNotes: (notes: string) => void;

  // Status
  isSubmitting: boolean;
  completedBooking: Booking | null;
  completedQueue: QueueInfo | null;
  handleSubmitBooking: () => Promise<void>;
  handleReset: () => void;

  // Helpers
  isStepDone: (step: number) => boolean;
  getStepNumberClass: (step: number) => string;
}

const WalkinBookingContext = createContext<WalkinBookingContextType | undefined>(undefined);

export function WalkinBookingProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('receptionistWalkinBooking');

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingType, setBookingType] = useState<'PRE_BOOKING' | 'WALK_IN'>('WALK_IN');

  // Patient
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 5, totalPages: 0 });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    fullName: '', phone: '', email: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    isGuest: false, address: '', dateOfBirth: '', nationalId: '', bloodType: '',
  });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  // Doctor (Step 2 — load all doctors, no service filter)
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Appointment Time (Step 3)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [patientNotes, setPatientNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [completedQueue, setCompletedQueue] = useState<QueueInfo | null>(null);

  // Load initial patient list and all doctors on mount
  useEffect(() => {
    Promise.all([
      usersApi.searchPatients('', 1, 5),
      doctorsApi.getAll(),
    ]).then(([patientsRes, doctorsRes]) => {
      setSearchResults(patientsRes.users);
      setPagination(patientsRes.pagination);
      setDoctors(doctorsRes);
    }).catch(console.error).finally(() => setIsLoadingDoctors(false));
  }, []);

  // Fetch slots for pre-booking when doctor or date changes
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const slots = await schedulesApi.getAvailableSlots({
        doctorId: selectedDoctor.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
      setAvailableSlots(slots.map(s => s.time));
    } catch (err) {
      console.error('[fetchSlots]', err);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (bookingType === 'PRE_BOOKING') void fetchSlots();
  }, [fetchSlots, bookingType]);

  const handleSearchPatient = async (page: number = 1) => {
    setIsSearching(true);
    try {
      const response = await usersApi.searchPatients(searchQuery, page, 5);
      setSearchResults(response.users);
      setPagination(response.pagination);
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  const setPage = (pageNumber: number) => handleSearchPatient(pageNumber);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPatient(true);
    try {
      const created = newPatient.isGuest
        ? await usersApi.createGuestPatient(newPatient)
        : await usersApi.registerPatient(newPatient);
      selectPatient(created);
      toast.success(t('toasts.createSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.createError'));
    } finally {
      setIsCreatingPatient(false);
    }
  };

  const selectPatient = (patient: User) => {
    setSelectedPatient(patient);
    setCurrentStep(2);
  };

  const selectSlot = (slot: string) => setSelectedSlot(slot);

  const handleSubmitBooking = async () => {
    const isWalkIn = bookingType === 'WALK_IN';

    // Mô hình A: chỉ cần BN + BS, không cần serviceId
    if (!selectedPatient || !selectedDoctor) {
      toast.error(t('toasts.fillAllSteps'));
      return;
    }
    if (!isWalkIn && !selectedSlot) {
      toast.error(t('toasts.fillAllSteps'));
      return;
    }

    setIsSubmitting(true);
    try {
      // Tạo booking với serviceId = undefined (null) — BS sẽ xác định sau
      const booking = await bookingsApi.createReceptionistBooking({
        patientProfileId: selectedPatient.patientProfile?.id || selectedPatient.id,
        doctorId: selectedDoctor.id,
        // serviceId deliberately omitted — mô hình A
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: isWalkIn ? undefined : (selectedSlot ?? undefined),
        isPreBooked: !isWalkIn,
        patientNotes,
      });

      // Auto check-in ngay sau khi tạo booking walk-in (theo B1)
      if (isWalkIn) {
        try {
          const checkInResult = await bookingsApi.checkIn(booking.id);
          setCompletedQueue(checkInResult.queue);
        } catch (checkInErr) {
          console.error('[AutoCheckIn]', checkInErr);
          // Check-in fail không block — hiển thị booking thành công vẫn OK
        }
      }

      setCompletedBooking(booking);
      toast.success(t('toasts.bookingSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.bookingError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setBookingType('WALK_IN');
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowCreateForm(false);
    setSelectedDoctor(null);
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setAvailableSlots([]);
    setPatientNotes('');
    setCompletedBooking(null);
    setCompletedQueue(null);
  };

  // Step 1 = BN, Step 2 = BS, Step 3 = Time/Confirm (luồng mới 3 steps)
  const isStepDone = (step: number) => {
    if (step === 1) return selectedPatient !== null;
    if (step === 2) return selectedDoctor !== null;
    if (step === 3) return bookingType === 'WALK_IN' ? true : selectedSlot !== null;
    return false;
  };

  const getStepNumberClass = (step: number) => {
    if (currentStep === step) return 'bg-[#1570EF] text-white border-transparent';
    if (isStepDone(step)) return 'bg-white text-[#1570EF] border-[#1570EF]';
    return 'bg-white text-slate-400 border-slate-200';
  };

  const value = useMemo(() => ({
    currentStep, setCurrentStep,
    bookingType, setBookingType,
    searchQuery, setSearchQuery, isSearching, selectedPatient, searchResults,
    pagination, setPage,
    showCreateForm, setShowCreateForm, newPatient, setNewPatient, isCreatingPatient,
    handleSearchPatient, handleCreatePatient, selectPatient,
    doctors, isLoadingDoctors,
    selectedDoctor, setSelectedDoctor,
    selectedDate, setSelectedDate, selectedSlot, selectSlot,
    availableSlots, isLoadingSlots, patientNotes, setPatientNotes,
    isSubmitting, completedBooking, completedQueue, handleSubmitBooking, handleReset,
    isStepDone, getStepNumberClass,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    currentStep, bookingType, searchQuery, isSearching, selectedPatient, searchResults,
    pagination, showCreateForm, newPatient, isCreatingPatient,
    doctors, isLoadingDoctors,
    selectedDoctor, selectedDate, selectedSlot,
    availableSlots, isLoadingSlots, patientNotes,
    isSubmitting, completedBooking, completedQueue,
  ]);

  return (
    <WalkinBookingContext.Provider value={value}>
      {children}
    </WalkinBookingContext.Provider>
  );
}

export function useWalkinBooking() {
  const context = useContext(WalkinBookingContext);
  if (!context) throw new Error('useWalkinBooking must be used within a WalkinBookingProvider');
  return context;
}
