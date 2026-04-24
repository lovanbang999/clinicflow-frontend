'use client';

import { useEffect } from 'react';
import { WalkinBookingProvider, useWalkinBooking } from './WalkinBookingContext';
import { ModeToggle } from './steps/ModeToggle';
import { PatientSelectionStep } from './steps/PatientSelectionStep';
import { DoctorSelectionStep } from './steps/DoctorSelectionStep';
import { DirectServiceStep } from './steps/DirectServiceStep';
import { AppointmentTimeStep } from './steps/AppointmentTimeStep';
import { BookingSummaryCard } from './steps/BookingSummaryCard';
import { CompletedBooking } from './steps/CompletedBooking';

interface WalkinBookingFormProps {
  onCompleteChange?: (isCompleted: boolean) => void;
}

function WalkinBookingContent({ onCompleteChange }: WalkinBookingFormProps) {
  const { completedBooking, bookingMode } = useWalkinBooking();

  useEffect(() => {
    onCompleteChange?.(!!completedBooking);
  }, [completedBooking, onCompleteChange]);

  if (completedBooking) {
    return <CompletedBooking />;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 pb-12 w-full">
      {/* Left Column: Form Steps */}
      <div className="flex-1 flex flex-col pl-2 min-w-0">
        {/* Mode Toggle — always shown before steps */}
        <ModeToggle />

        {/* Step 1 — Patient Selection (shared across modes) */}
        <PatientSelectionStep />

        {/* Step 2 — Mode-dependent */}
        {bookingMode === 'CONSULTATION'
          ? <DoctorSelectionStep />
          : <DirectServiceStep />
        }

        {/* Step 3 — Appointment Time / Confirm (shared across modes) */}
        <AppointmentTimeStep />
      </div>

      {/* Right Column: Booking Summary Card */}
      <BookingSummaryCard />
    </div>
  );
}

export function WalkinBookingForm({ onCompleteChange }: WalkinBookingFormProps) {
  return (
    <WalkinBookingProvider>
      <WalkinBookingContent onCompleteChange={onCompleteChange} />
    </WalkinBookingProvider>
  );
}
