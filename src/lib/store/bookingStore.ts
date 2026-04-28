import { create } from 'zustand';
import { Doctor, Service } from '@/types';

export type BookingStep = 0 | 1 | 2 | 3 | 4 | 5;
export type BookingType = 'CONSULTATION' | 'SPECIALIST';

interface BookingState {
  // Current step in booking flow
  currentStep: BookingStep;
  
  // Selected data
  bookingType: BookingType | null;
  selectedService: Service | null;
  selectedDoctor: Doctor | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  patientNotes: string;
  
  // Actions
  setBookingType: (type: BookingType | null) => void;
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
  currentStep: 0,
  bookingType: null,
  selectedService: null,
  selectedDoctor: null,
  selectedDate: null,
  selectedTimeSlot: null,
  patientNotes: '',
  
  setBookingType: (type) => {
    // Reset data when type changes
    set({ 
      bookingType: type,
      selectedService: null,
      selectedDoctor: null,
      selectedDate: null,
      selectedTimeSlot: null,
    });
  },

  setCurrentStep: (step) => set({ currentStep: step }),
  
  setSelectedService: (service) => set({ selectedService: service }),
  
  setSelectedDoctor: (doctor) => set({ selectedDoctor: doctor }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
  
  setPatientNotes: (notes) => set({ patientNotes: notes }),
  
  nextStep: () => {
    const { currentStep, canProceedToNextStep, bookingType } = get();
    if (canProceedToNextStep()) {
      if (currentStep === 0) {
        if (bookingType === 'CONSULTATION') {
          set({ currentStep: 2 }); // Skip service selection
        } else {
          set({ currentStep: 1 });
        }
      } else if (currentStep < 5) {
        set({ currentStep: (currentStep + 1) as BookingStep });
      }
    }
  },
  
  previousStep: () => {
    const { currentStep, bookingType } = get();
    if (currentStep === 2 && bookingType === 'CONSULTATION') {
      set({ currentStep: 0 }); // Skip service selection back to start
    } else if (currentStep > 0) {
      set({ currentStep: (currentStep - 1) as BookingStep });
    }
  },
  
  resetBooking: () => set({
    currentStep: 0,
    bookingType: null,
    selectedService: null,
    selectedDoctor: null,
    selectedDate: null,
    selectedTimeSlot: null,
    patientNotes: '',
  }),
  
  canProceedToNextStep: () => {
    const { currentStep, bookingType, selectedService, selectedDoctor, selectedDate, selectedTimeSlot } = get();
        
    switch (currentStep) {
      case 0:
        return bookingType !== null;
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
