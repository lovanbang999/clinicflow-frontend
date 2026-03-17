'use client';

import { WalkinBookingProvider, useWalkinBooking } from './WalkinBookingContext';
import { PatientSelectionStep } from './steps/PatientSelectionStep';
import { ServiceSelectionStep } from './steps/ServiceSelectionStep';
import { DoctorSelectionStep } from './steps/DoctorSelectionStep';
import { AppointmentTimeStep } from './steps/AppointmentTimeStep';
import { BookingSummaryCard } from './steps/BookingSummaryCard';
import { CompletedBooking } from './steps/CompletedBooking';

function WalkinBookingContent() {
  const { completedBooking } = useWalkinBooking();

  if (completedBooking) {
    return <CompletedBooking />;
  }

  return (
    <div className="flex flex-col xl:flex-row gap-8 pb-12 w-full">
      {/* Left Column: Form Steps */}
      <div className="flex-1 flex flex-col pl-2 min-w-0">
        <PatientSelectionStep />
        <ServiceSelectionStep />
        <DoctorSelectionStep />
        <AppointmentTimeStep />
      </div>

      {/* Right Column: Booking Summary Card */}
      <BookingSummaryCard />
    </div>
  );
}

export function WalkinBookingForm() {
  return (
    <WalkinBookingProvider>
      <WalkinBookingContent />
    </WalkinBookingProvider>
  );
}
