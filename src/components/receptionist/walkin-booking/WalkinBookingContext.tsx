'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { usersApi } from '@/lib/api/users';
import { servicesApi } from '@/lib/api/services';
import { doctorsApi } from '@/lib/api/doctors';
import { bookingsApi } from '@/lib/api/bookings';
import { schedulesApi } from '@/lib/api/schedules';
import { User, Service, Doctor, Booking } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

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

  // Booking details
  services: Service[];
  isLoadingServices: boolean;
  doctors: Doctor[];
  isLoadingDoctors: boolean;
  selectedService: Service | null;
  selectService: (service: Service) => void;
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doctor: Doctor | null) => void;
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

  // Booking details
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [patientNotes, setPatientNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Load services + initial patient list on mount
  useEffect(() => {
    setIsLoadingServices(true);
    Promise.all([
      servicesApi.getAll({ isActive: true }),
      usersApi.searchPatients('', 1, 5),
    ]).then(([svcs, patientsRes]) => {
      setServices(svcs);
      setSearchResults(patientsRes.users);
      setPagination(patientsRes.pagination);
    }).catch(console.error).finally(() => setIsLoadingServices(false));
  }, []);

  // Re-fetch doctors filtered by service when service changes
  useEffect(() => {
    if (!selectedService) return;
    setIsLoadingDoctors(true);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    doctorsApi.getAll({ serviceId: selectedService.id })
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setIsLoadingDoctors(false));
  }, [selectedService]);

  // Fetch real available slots when doctor or date changes
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate || !selectedService) {
      setAvailableSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const slots = await schedulesApi.getAvailableSlots({
        doctorId: selectedDoctor.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        serviceId: selectedService.id,
      });
      setAvailableSlots(slots.map(s => s.time));
    } catch (err) {
      console.error('[fetchSlots]', err);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctor, selectedDate, selectedService]);

  useEffect(() => {
    if (bookingType === 'PRE_BOOKING') fetchSlots();
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

  const selectService = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(3);
  };

  const selectSlot = (slot: string) => setSelectedSlot(slot);

  const handleSubmitBooking = async () => {
    const isWalkIn = bookingType === 'WALK_IN';
    if (!selectedPatient || !selectedService || !selectedDoctor) {
      toast.error(t('toasts.fillAllSteps'));
      return;
    }
    if (!isWalkIn && !selectedSlot) {
      toast.error(t('toasts.fillAllSteps'));
      return;
    }
    setIsSubmitting(true);
    try {
      const booking = await bookingsApi.createReceptionistBooking({
        patientProfileId: selectedPatient.patientProfile?.id || selectedPatient.id,
        serviceId: selectedService.id,
        doctorId: selectedDoctor.id,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: isWalkIn ? undefined : (selectedSlot ?? undefined),
        isPreBooked: !isWalkIn,
        patientNotes,
      });
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
    setSelectedService(null);
    setSelectedDoctor(null);
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setAvailableSlots([]);
    setPatientNotes('');
    setCompletedBooking(null);
  };

  const isStepDone = (step: number) => {
    if (step === 1) return selectedPatient !== null;
    if (step === 2) return selectedService !== null;
    if (step === 3) return selectedDoctor !== null;
    if (step === 4) return bookingType === 'WALK_IN' ? true : selectedSlot !== null;
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
    services, isLoadingServices, doctors, isLoadingDoctors,
    selectedService, selectService, selectedDoctor, setSelectedDoctor,
    selectedDate, setSelectedDate, selectedSlot, selectSlot,
    availableSlots, isLoadingSlots, patientNotes, setPatientNotes,
    isSubmitting, completedBooking, handleSubmitBooking, handleReset,
    isStepDone, getStepNumberClass,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    currentStep, bookingType, searchQuery, isSearching, selectedPatient, searchResults,
    pagination, showCreateForm, newPatient, isCreatingPatient,
    services, isLoadingServices, doctors, isLoadingDoctors,
    selectedService, selectedDoctor, selectedDate, selectedSlot,
    availableSlots, isLoadingSlots, patientNotes,
    isSubmitting, completedBooking,
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
