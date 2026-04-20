'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ServiceSelector } from '@/components/booking/ServiceSelector';
import { DoctorSelector } from '@/components/booking/DoctorSelector';
import { DatePicker } from '@/components/booking/DatePicker';
import { TimeSlotGrid } from '@/components/booking/TimeSlotGrid';
import { BookingConfirmation } from '@/components/booking/BookingConfirmation';
import { FlowSelection } from '@/components/booking/FlowSelection';
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

  const bookingType = useBookingStore((s) => s.bookingType);
  const [searchQuery, setSearchQuery] = useState('');

  const t = useTranslations('booking');

  const canProceed =
    currentStep === 0
      ? !!bookingType
      : currentStep === 1
      ? !!selectedService
      : currentStep === 2
      ? !!selectedDoctor
      : currentStep === 3
      ? !!selectedDate
      : currentStep === 4
      ? !!selectedTimeSlot
      : true;

  const steps = [
    { number: 0, label: t('stepLabels.type') },
    ...(bookingType === 'SPECIALIST' ? [{ number: 1, label: t('stepLabels.service') }] : []),
    { number: 2, label: t('stepLabels.doctor') },
    { number: 3, label: t('stepLabels.date') },
    { number: 4, label: t('stepLabels.time') },
    { number: 5, label: t('stepLabels.confirmation') },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <FlowSelection />;
      case 1:
        return <ServiceSelector searchQuery={searchQuery} />;
      case 2:
        return <DoctorSelector />;
      case 3:
        return <DatePicker />;
      case 4:
        return <TimeSlotGrid />;
      case 5:
        return <BookingConfirmation />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-20 md:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 md:pt-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {currentStep === 0 && t('selection.title')}
              {currentStep === 1 && t('stepTitles.service')}
              {currentStep === 2 && t('stepTitles.doctor')}
              {currentStep === 3 && t('stepTitles.date')}
              {currentStep === 4 && t('stepTitles.time')}
              {currentStep === 5 && t('stepTitles.confirmation')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm md:text-base">
              {currentStep === 0 && (
                !bookingType 
                  ? t('subtitle') 
                  : bookingType === 'CONSULTATION' 
                  ? t('selection.consultation.subtitle') 
                  : t('selection.specialist.subtitle')
              )}
              {currentStep === 1 && t('stepSubtitles.service')}
              {currentStep === 2 && t('stepSubtitles.doctor')}
              {currentStep === 3 && t('stepSubtitles.date')}
              {currentStep === 4 && t('stepSubtitles.time')}
              {currentStep === 5 && t('stepSubtitles.confirmation')}
            </p>
          </div>

          {currentStep === 1 && (
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t('searchServices')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-medium dark:bg-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="flex items-center md:justify-center gap-1.5 sm:gap-3 mb-8 sm:mb-10 md:mb-12 overflow-x-auto no-scrollbar pb-2 sm:pb-0">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center shrink-0">
              <div className={cn(
                "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 border-2",
                currentStep === step.number 
                  ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20" 
                  : currentStep > step.number
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600"
              )}>
                <span className="text-xs sm:text-sm font-black italic uppercase tracking-tighter">
                  {currentStep > step.number ? '✓' : `0${idx + 1}`}
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn(
                  "w-4 sm:w-6 md:w-8 h-0.5 mx-1.5 sm:mx-2 rounded-full",
                  currentStep > step.number ? "bg-emerald-200 dark:bg-emerald-500/30" : "bg-slate-100 dark:bg-slate-800"
                )}></div>
              )}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="mb-12 min-h-[400px] pb-24 md:pb-0">
          {renderStepContent()}
        </div>


        {/* Navigation Footer */}
        <div className={cn(
          "fixed bottom-0 left-0 right-0 z-40 py-4 px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] dark:shadow-none",
          "md:relative md:bg-transparent md:backdrop-blur-none md:border-t-0 md:p-0 md:mx-0 md:pt-8 md:pb-4 md:shadow-none"
        )}>
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={previousStep}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer",
                currentStep === 0 
                  ? "invisible" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              )}
            >
              <ArrowLeft className="w-5 h-5" />
              {t('back')}
            </button>

            {currentStep < 5 && (
              <button
                onClick={nextStep}
                disabled={!canProceed}
                className={cn(
                  "flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-xl shadow-blue-500/20 cursor-pointer",
                  !canProceed
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                {t('continue')}
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
