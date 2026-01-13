'use client';

import { BookingSteps } from '@/components/booking/BookingSteps';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { DoctorSelector } from '@/components/booking/DoctorSelector';
import { DatePicker } from '@/components/booking/DatePicker';
import { TimeSlotGrid } from '@/components/booking/TimeSlotGrid';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { SmartSuggestions } from '@/components/booking/SmartSuggestions';
import { Button } from '@/components/ui/button';
import { useBookingStore } from '@/lib/store/bookingStore';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BookingPage() {
  const currentStep = useBookingStore((s) => s.currentStep);
  const nextStep = useBookingStore((s) => s.nextStep);
  const previousStep = useBookingStore((s) => s.previousStep);

  const selectedService = useBookingStore((s) => s.selectedService);
  const selectedDoctor = useBookingStore((s) => s.selectedDoctor);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTimeSlot = useBookingStore((s) => s.selectedTimeSlot);

  const canProceed =
    currentStep === 1
      ? !!selectedService
      : currentStep === 2
      ? !!selectedDoctor
      : currentStep === 3
      ? !!selectedDate
      : currentStep === 4
      ? !!selectedTimeSlot
      : true;

  const steps = [
    { number: 1, label: 'Chọn dịch vụ' },
    { number: 2, label: 'Chọn bác sĩ' },
    { number: 3, label: 'Chọn ngày' },
    { number: 4, label: 'Chọn giờ' },
    { number: 5, label: 'Xác nhận' },
  ];

  const stepTitles: Record<number, string> = {
    1: 'Chọn dịch vụ khám',
    2: 'Chọn bác sĩ khám',
    3: 'Chọn ngày khám',
    4: 'Chọn giờ khám',
    5: 'Xác nhận thông tin',
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ServiceSelector />;
      case 2:
        return <DoctorSelector />;
      case 3:
        return (
          <div className="flex justify-center">
            <DatePicker />
          </div>
        );
      case 4:
        return <TimeSlotGrid />;
      case 5:
        return <BookingConfirmation />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-8 shadow-lg rounded-4xl">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">Đặt lịch khám bệnh</h1>
          <p className="text-center text-blue-100 mt-2">
            Đặt lịch nhanh chóng và thuận tiện
          </p>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-8">
        <BookingSteps steps={steps} currentStep={currentStep} />

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {stepTitles[currentStep]}
          </h2>
        </div>

        <div className="mb-8">{renderStepContent()}</div>

        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto mb-8">
            <SmartSuggestions />
          </div>
        )}

        {currentStep < 5 && (
          <div className="flex items-center justify-between mx-auto pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={previousStep}
              disabled={currentStep === 1}
              className={cn('px-6 cursor-pointer', currentStep === 1 && 'invisible')}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Quay lại
            </Button>

            <Button
              size="lg"
              onClick={nextStep}
              disabled={!canProceed}
              className="px-6 cursor-pointer"
            >
              Tiếp tục
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
