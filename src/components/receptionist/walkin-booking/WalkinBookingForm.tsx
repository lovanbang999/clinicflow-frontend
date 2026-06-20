'use client';

import { useEffect } from 'react';
import { WalkinBookingProvider, useWalkinBooking } from './WalkinBookingContext';
// import { ModeToggle } from './steps/ModeToggle'; // HIDDEN: Direct Service flow — re-enable when ready
import { PatientSelectionStep } from './steps/PatientSelectionStep';
import { DoctorSelectionStep } from './steps/DoctorSelectionStep';
// import { DirectServiceStep } from './steps/DirectServiceStep'; // HIDDEN: Direct Service flow — re-enable when ready
import { AppointmentTimeStep } from './steps/AppointmentTimeStep';
import { BookingSummaryCard } from './steps/BookingSummaryCard';
import { CompletedBooking } from './steps/CompletedBooking';
import { TempPasswordDisplayModal } from '../patients/TempPasswordDisplayModal';

interface WalkinBookingFormProps {
  onCompleteChange?: (isCompleted: boolean) => void;
}

function WalkinBookingContent({ onCompleteChange }: WalkinBookingFormProps) {
  const { completedBooking, tempPasswordData, setTempPasswordData } = useWalkinBooking();
  // const { completedBooking, bookingMode } = useWalkinBooking(); // HIDDEN: bookingMode used by Direct Service flow

  useEffect(() => {
    onCompleteChange?.(!!completedBooking);
  }, [completedBooking, onCompleteChange]);

  if (completedBooking) {
    return <CompletedBooking />;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 pb-12 w-full relative">
      {/* Left Column: Form Steps */}
      <div className="flex-1 flex flex-col pl-2 min-w-0">
        {/* HIDDEN: Mode Toggle — re-enable when Direct Service flow is ready */}
        {/* <ModeToggle /> */}

        {/* Step 1 — Patient Selection */}
        <PatientSelectionStep />

        {/* Step 2 — Doctor Selection (Consultation only) */}
        {/* HIDDEN: Mode-dependent step — re-enable when Direct Service flow is ready */}
        {/* {bookingMode === 'CONSULTATION'
          ? <DoctorSelectionStep />
          : <DirectServiceStep />
        } */}
        <DoctorSelectionStep />

        {/* Step 3 — Appointment Time / Confirm */}
        <AppointmentTimeStep />
      </div>

      {/* Right Column: Booking Summary Card */}
      <BookingSummaryCard />

      <TempPasswordDisplayModal
        isOpen={!!tempPasswordData}
        onClose={() => setTempPasswordData(null)}
        tempPasswordData={tempPasswordData}
      />
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
