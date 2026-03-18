'use client';

import { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { usersApi } from '@/lib/api/users';
import { servicesApi } from '@/lib/api/services';
import { doctorsApi } from '@/lib/api/doctors';
import { bookingsApi } from '@/lib/api/bookings';
import { User, Service, Doctor, Booking } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';

interface WalkinBookingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  // Patient Selection
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  selectedPatient: User | null;
  searchResults: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
  doctors: Doctor[];
  selectedService: Service | null;
  selectService: (service: Service) => void;
  selectedDoctor: Doctor | null;
  setSelectedDoctor: (doctor: Doctor | null) => void;
  selectedDate: Date;
  selectedSlot: string | null;
  selectSlot: (slot: string) => void;
  availableSlots: string[];
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
  const t = useTranslations('dashboard.receptionist.walkinBookingForm');
  // State from previous WalkinBookingForm
  const [currentStep, setCurrentStep] = useState(1);

  // Patient Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0,
  });

  // Quick Create Patient
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER',
    isGuest: false,
    address: '',
    dateOfBirth: '',
    nationalId: '',
    bloodType: '',
  });
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  // Booking details
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientNotes, setPatientNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  // Load initial data on mount
  useEffect(() => {
    servicesApi.getAll({ isActive: true }).then(setServices).catch(console.error);
    doctorsApi.getAll({}).then(setDoctors).catch(console.error);
    usersApi.searchPatients('', 1, 5).then((res) => {
      setSearchResults(res.users);
      setPagination(res.pagination);
    }).catch(console.error);
  }, []);

  const handleSearchPatient = async (page: number = 1) => {
    setIsSearching(true);
    try {
      const response = await usersApi.searchPatients(searchQuery, page, 5);
      setSearchResults(response.users);
      setPagination(response.pagination);
      
      if (response.users.length === 0 && searchQuery) {
        setShowCreateForm(false);
      } else {
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(t('toasts.searchError'));
    } finally {
      setIsSearching(false);
    }
  };

  const setPage = (pageNumber: number) => {
    handleSearchPatient(pageNumber);
  };

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
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setCurrentStep(3);
  };

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    // Generate mock slots from 08:00 to 16:30 every 30 mins
    const slots = [];
    for (let i = 8; i < 12; i++) {
        slots.push(`${i.toString().padStart(2, '0')}:00`);
        slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, [selectedDoctor, selectedDate]);

  const selectSlot = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleSubmitBooking = async () => {
    if (!selectedPatient || !selectedService || !selectedDoctor || !selectedDate || !selectedSlot) {
      toast.error(t('toasts.fillAllSteps'));
      return;
    }
    setIsSubmitting(true);
    try {
        const booking = await bookingsApi.createReceptionistBooking({
            patientProfileId: selectedPatient.patientProfile?.id || selectedPatient.id, // Fallback if profile not loaded
            serviceId: selectedService.id,
            doctorId: selectedDoctor.id,
            bookingDate: format(selectedDate, 'yyyy-MM-dd'),
            startTime: selectedSlot,
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
    setSelectedPatient(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowCreateForm(false);
    setSelectedService(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
    setPatientNotes('');
    setCompletedBooking(null);
  };

  const isStepDone = (step: number) => {
    if (step === 1) return selectedPatient !== null;
    if (step === 2) return selectedService !== null;
    if (step === 3) return selectedDoctor !== null;
    if (step === 4) return selectedSlot !== null;
    return false;
  };

  const getStepNumberClass = (step: number) => {
    if (currentStep === step) return 'bg-[#1570EF] text-white border-transparent';
    if (isStepDone(step)) return 'bg-white text-[#1570EF] border-[#1570EF]';
    return 'bg-white text-slate-400 border-slate-200';
  };

  return (
    <WalkinBookingContext.Provider
      value={{
        currentStep, setCurrentStep,
        searchQuery, setSearchQuery, isSearching, selectedPatient, searchResults,
        pagination, setPage,
        showCreateForm, setShowCreateForm, newPatient, setNewPatient, isCreatingPatient,
        handleSearchPatient, handleCreatePatient, selectPatient,
        services, doctors, selectedService, selectService, selectedDoctor, setSelectedDoctor,
        selectedDate, selectedSlot, selectSlot, availableSlots, patientNotes, setPatientNotes,
        isSubmitting, completedBooking, handleSubmitBooking, handleReset,
        isStepDone, getStepNumberClass
      }}
    >
      {children}
    </WalkinBookingContext.Provider>
  );
}

export function useWalkinBooking() {
  const context = useContext(WalkinBookingContext);
  if (!context) {
    throw new Error('useWalkinBooking must be used within a WalkinBookingProvider');
  }
  return context;
}
