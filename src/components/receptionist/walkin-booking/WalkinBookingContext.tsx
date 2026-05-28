'use client';

import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { usersApi } from '@/lib/api/auth/users';
import { doctorsApi } from '@/lib/api/clinical/doctors';
import { bookingsApi } from '@/lib/api/appointment/bookings';
import { schedulesApi } from '@/lib/api/appointment/schedules';
// import { servicesApi } from '@/lib/api/clinic/services'; // HIDDEN: used by Direct Service flow — re-enable when ready
import { User, Doctor, Booking, Service } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

export type BookingMode = 'CONSULTATION' | 'DIRECT_SERVICE';

interface QueueInfo {
  queuePosition: number;
  estimatedWaitMinutes: number;
}

interface WalkinBookingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  bookingType: 'PRE_BOOKING' | 'WALK_IN';
  setBookingType: (type: 'PRE_BOOKING' | 'WALK_IN') => void;

  // Mode A/B toggle
  bookingMode: BookingMode;
  setBookingMode: (mode: BookingMode) => void;

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
  tempPasswordData: { password?: string; fullName?: string; email?: string } | null;
  setTempPasswordData: (data: { password?: string; fullName?: string; email?: string } | null) => void;

  // Doctor Selection (Step 2 — Mode A: consultation doctor)
  doctors: Doctor[];
  isLoadingDoctors: boolean;
  bookedDoctorIds: Set<string>;
  isCheckingDuplicates: boolean;
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doctor: Doctor | null) => void;

  // Mode B — Direct Service
  allServices: Service[];
  isLoadingServices: boolean;
  selectedServices: Service[];
  toggleService: (service: Service) => void;
  dutyDoctor: Doctor | null;
  setDutyDoctor: (doctor: Doctor | null) => void;
  serviceAssignments: Record<string, string>; // { [serviceId]: performingDoctorId }
  setServiceAssignment: (serviceId: string, doctorId: string | null) => void;

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
  const [bookingMode, setBookingModeState] = useState<BookingMode>('CONSULTATION');

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
  const [tempPasswordData, setTempPasswordData] = useState<{ password?: string; fullName?: string; email?: string } | null>(null);

  // Doctor (Mode A — Step 2)
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [bookedDoctorIds, setBookedDoctorIds] = useState<Set<string>>(new Set());
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Mode B state
  const [allServices] = useState<Service[]>([]);
  const [isLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [dutyDoctor, setDutyDoctor] = useState<Doctor | null>(null);
  const [serviceAssignments, setServiceAssignmentsState] = useState<Record<string, string>>({});

  const setServiceAssignment = useCallback((serviceId: string, doctorId: string | null) => {
    setServiceAssignmentsState(prev => {
      if (doctorId === null) {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      }
      return { ...prev, [serviceId]: doctorId };
    });
  }, []);

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

  const setBookingMode = useCallback((mode: BookingMode) => {
    setBookingModeState(mode);
    // Reset step-2 state when switching modes
    setSelectedDoctor(null);
    setSelectedServices([]);
    setDutyDoctor(null);
    setServiceAssignmentsState({});
    setCurrentStep(selectedPatient ? 2 : 1);
  }, [selectedPatient]);

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

  // HIDDEN: Load all services for Mode B (Direct Service) — re-enable when flow is ready
  // useEffect(() => {
  //   if (bookingMode === 'DIRECT_SERVICE' && allServices.length === 0) {
  //     setIsLoadingServices(true);
  //     servicesApi.getAll({ isActive: true })
  //       .then(setAllServices)
  //       .catch(console.error)
  //       .finally(() => setIsLoadingServices(false));
  //   }
  // }, [bookingMode, allServices.length]);

  // Fetch slots for pre-booking when doctor or date changes
  const fetchSlots = useCallback(async () => {
    const doctorForSlots = bookingMode === 'CONSULTATION' ? selectedDoctor : dutyDoctor;
    if (!doctorForSlots || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const slots = await schedulesApi.getAvailableSlots({
        doctorId: doctorForSlots.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
      });
      setAvailableSlots(slots.map(s => s.time));
    } catch (err) {
      console.error('[fetchSlots]', err);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctor, dutyDoctor, selectedDate, bookingMode]);

  useEffect(() => {
    if (bookingType === 'PRE_BOOKING') void fetchSlots();
  }, [fetchSlots, bookingType]);

  // Fetch existing bookings for the patient to prevent duplicates
  const fetchPatientBookings = useCallback(async () => {
    if (!selectedPatient) {
      setBookedDoctorIds(new Set());
      return;
    }

    setIsCheckingDuplicates(true);
    try {
      const today = format(selectedDate, 'yyyy-MM-dd');
      const response = await bookingsApi.getAll({
        patientProfileId: selectedPatient.patientProfile?.id || selectedPatient.id,
        date: today,
        limit: 100,
      });

      const activeBookings = (response?.bookings || []).filter(b =>
        !['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(b.status)
      );

      setBookedDoctorIds(new Set(activeBookings.map(b => b.doctorId)));
    } catch (err) {
      console.error('[fetchPatientBookings]', err);
      setBookedDoctorIds(new Set());
    } finally {
      setIsCheckingDuplicates(false);
    }
  }, [selectedPatient, selectedDate]);

  useEffect(() => {
    if (selectedPatient) {
      void fetchPatientBookings();
    }
  }, [selectedPatient, selectedDate, fetchPatientBookings]);

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
      if (!newPatient.isGuest) {
        const standardPatient = created as User & { tempPassword?: string };
        if (standardPatient.tempPassword) {
          setTempPasswordData({
            password: standardPatient.tempPassword,
            fullName: standardPatient.fullName,
            email: standardPatient.email || newPatient.email,
          });
        } else {
          toast.success(t('toasts.createSuccess'));
        }
      } else {
        toast.success(t('toasts.createSuccess'));
      }
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

  const toggleService = useCallback((service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      return exists ? prev.filter(s => s.id !== service.id) : [...prev, service];
    });
  }, []);

  const handleSubmitBooking = async () => {
    const isWalkIn = bookingType === 'WALK_IN';

    // HIDDEN: Mode B (Direct Service) submit logic — re-enable when flow is ready
    // if (bookingMode === 'DIRECT_SERVICE') {
    //   // Mode B validation
    //   if (!selectedPatient || selectedServices.length === 0 || !dutyDoctor) {
    //     toast.error(t('toasts.fillAllSteps'));
    //     return;
    //   }
    //   if (!isWalkIn && !selectedSlot) {
    //     toast.error(t('toasts.fillAllSteps'));
    //     return;
    //   }
    //
    //   setIsSubmitting(true);
    //   try {
    //     const booking = await bookingsApi.createDirectServiceBooking({
    //       patientProfileId: selectedPatient.patientProfile?.id || selectedPatient.id,
    //       doctorId: dutyDoctor.id,
    //       serviceIds: selectedServices.map(s => s.id),
    //       serviceAssignments: selectedServices
    //         .filter(s => s.performerType === 'DOCTOR' && serviceAssignments[s.id])
    //         .map(s => ({ serviceId: s.id, performingDoctorId: serviceAssignments[s.id] })),
    //       bookingDate: format(selectedDate, 'yyyy-MM-dd'),
    //       isPreBooked: !isWalkIn,
    //       startTime: isWalkIn ? undefined : (selectedSlot ?? undefined),
    //       patientNotes,
    //     });
    //
    //     setCompletedBooking(booking);
    //     toast.success(t('toasts.bookingSuccess'));
    //   } catch (err) {
    //     console.error(err);
    //     toast.error(t('toasts.bookingError'));
    //   } finally {
    //     setIsSubmitting(false);
    //   }
    //   return;
    // }

    // Mode A (Consultation) — existing flow
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
      const booking = await bookingsApi.createReceptionistBooking({
        patientProfileId: selectedPatient.patientProfile?.id || selectedPatient.id,
        doctorId: selectedDoctor.id,
        bookingDate: format(selectedDate, 'yyyy-MM-dd'),
        startTime: isWalkIn ? undefined : (selectedSlot ?? undefined),
        isPreBooked: !isWalkIn,
        patientNotes,
      });

      // Auto check-in for walk-in consultation (B1)
      if (isWalkIn) {
        try {
          const checkInResult = await bookingsApi.checkIn(booking.id);
          setCompletedQueue(checkInResult.queue);
        } catch (checkInErr) {
          console.error('[AutoCheckIn]', checkInErr);
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
    setBookingModeState('CONSULTATION');
    setSelectedPatient(null);
    setSearchQuery('');
    setShowCreateForm(false);
    setSelectedDoctor(null);
    setBookedDoctorIds(new Set());
    setSelectedServices([]);
    setDutyDoctor(null);
    setServiceAssignmentsState({});
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setAvailableSlots([]);
    setPatientNotes('');
    setCompletedBooking(null);
    setCompletedQueue(null);

    setIsSearching(true);
    usersApi.searchPatients('', 1, 5)
      .then((res) => {
        setSearchResults(res.users);
        setPagination(res.pagination);
      })
      .catch((err) => {
        console.error(err);
        setSearchResults([]);
      })
      .finally(() => setIsSearching(false));
  };

  const isStepDone = (step: number) => {
    if (step === 1) return selectedPatient !== null;
    if (step === 2) {
      // HIDDEN: Mode B (Direct Service) step 2 logic — re-enable when flow is ready
      // if (bookingMode === 'DIRECT_SERVICE') {
      //   if (selectedServices.length === 0 || !dutyDoctor) return false;
      //   // All SPECIALIST services must have a performing doctor assigned
      //   const specialistServices = selectedServices.filter(s => s.performerType === 'DOCTOR');
      //   const allAssigned = specialistServices.every(s => !!serviceAssignments[s.id]);
      //   return allAssigned;
      // }
      return selectedDoctor !== null;
    }
    if (step === 3) return bookingType === 'WALK_IN' ? true : selectedSlot !== null;
    return false;
  };

  const getStepNumberClass = (step: number) => {
    const activeColor = 'bg-[#1570EF] text-white border-transparent';
    const doneColor = 'bg-white text-[#1570EF] border-[#1570EF]';
    if (currentStep === step) return activeColor;
    if (isStepDone(step)) return doneColor;
    return 'bg-white text-slate-400 border-slate-200';
  };

  const value = useMemo(() => ({
    currentStep, setCurrentStep,
    bookingType, setBookingType,
    bookingMode, setBookingMode,
    searchQuery, setSearchQuery, isSearching, selectedPatient, searchResults,
    pagination, setPage,
    showCreateForm, setShowCreateForm, newPatient, setNewPatient, isCreatingPatient,
    handleSearchPatient, handleCreatePatient, selectPatient,
    tempPasswordData, setTempPasswordData,
    doctors, isLoadingDoctors, bookedDoctorIds, isCheckingDuplicates,
    selectedDoctor, setSelectedDoctor,
    allServices, isLoadingServices, selectedServices, toggleService,
    dutyDoctor, setDutyDoctor, serviceAssignments, setServiceAssignment,
    selectedDate, setSelectedDate, selectedSlot, selectSlot,
    availableSlots, isLoadingSlots, patientNotes, setPatientNotes,
    isSubmitting, completedBooking, completedQueue, handleSubmitBooking, handleReset,
    isStepDone, getStepNumberClass,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [
    currentStep, bookingType, bookingMode, searchQuery, isSearching, selectedPatient, searchResults,
    pagination, showCreateForm, newPatient, isCreatingPatient, tempPasswordData,
    doctors, isLoadingDoctors, bookedDoctorIds, isCheckingDuplicates,
    selectedDoctor, allServices, isLoadingServices, selectedServices, dutyDoctor, serviceAssignments,
    selectedDate, selectedSlot, availableSlots, isLoadingSlots, patientNotes,
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
