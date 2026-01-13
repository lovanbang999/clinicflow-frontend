import { create } from 'zustand';
import { Doctor, Service } from '@/types';

export type BookingStep = 1 | 2 | 3 | 4 | 5;

interface BookingState {
  // Current step in booking flow
  currentStep: BookingStep;
  
  // Selected data
  selectedService: Service | null;
  selectedDoctor: Doctor | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  patientNotes: string;
  
  // Actions
  setCurrentStep: (step: BookingStep) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedDoctor: (doctor: Doctor | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTimeSlot: (timeSlot: string | null) => void;
  setPatientNotes: (notes: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  resetBooking: () => void;
  canProceedToNextStep: () => boolean;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  currentStep: 1,
  selectedService: null,
  selectedDoctor: null,
  selectedDate: null,
  selectedTimeSlot: null,
  patientNotes: '',
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setSelectedService: (service) => set({ selectedService: service }),
  
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
  
  setPatientNotes: (notes) => set({ patientNotes: notes }),
  
  nextStep: () => {
    const { currentStep, canProceedToNextStep } = get();
    if (canProceedToNextStep() && currentStep < 5) {
      set({ currentStep: (currentStep + 1) as BookingStep });
    }
  },
  
  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as BookingStep });
    }
  },
  
  resetBooking: () => set({
    currentStep: 1,
    selectedService: null,
    selectedDoctor: null,
    selectedDate: null,
    selectedTimeSlot: null,
    patientNotes: '',
  }),
  
  canProceedToNextStep: () => {
    const { currentStep, selectedService, selectedDoctor, selectedDate, selectedTimeSlot } = get();
        
    switch (currentStep) {
      case 1:
        return selectedService !== null;
      case 2:
        return selectedDoctor !== null;
      case 3:
        return selectedDate !== null;
      case 4:
        return selectedTimeSlot !== null;
      case 5:
        return true;
      default:
        return false;
    }
  },
}));
