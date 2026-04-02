'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useWalkinBooking } from '../WalkinBookingContext';
import {
  CalendarCheckIcon,
  CalendarBlankIcon,
  CaretRightIcon,
  SpinnerIcon,
  QueueIcon,
} from '@phosphor-icons/react';

export function BookingSummaryCard() {
  const t = useTranslations('receptionistWalkinBooking.summary');
  const tTime = useTranslations('receptionistWalkinBooking.time');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    selectedPatient,
    selectedService,
    selectedDoctor,
    selectedDate,
    selectedSlot,
    isSubmitting,
    handleSubmitBooking,
    bookingType,
  } = useWalkinBooking();

  const isWalkIn = bookingType === 'WALK_IN';
  const canSubmit = isStepDone(1) && isStepDone(2) && isStepDone(3) && isStepDone(4);

  return (
    <div className="w-full lg:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-6 sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarCheckIcon className="text-[#1570EF]" size={22} weight="fill" />
            <h2 className="text-[17px] font-bold text-slate-900">{t('title')}</h2>
          </div>
          {isWalkIn ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#16a34a] text-[11px] font-bold border border-[#86efac]/60">
              <QueueIcon size={12} weight="fill" />
              {tTime('walkInLabel')}
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#eff6ff] text-[#1570EF] text-[11px] font-bold border border-[#93c5fd]/60">
              <CalendarBlankIcon size={12} weight="fill" />
              {tTime('preBookingLabel')}
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1570EF] transition-all duration-300 rounded-full"
                style={{
                  width: `${(isStepDone(1) ? 25 : 0) + (isStepDone(2) ? 25 : 0) + (isStepDone(3) ? 25 : 0) + (isStepDone(4) ? 25 : 0)}%`,
                }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#1570EF] uppercase shrink-0">
              {t('stepProgress', { current: currentStep, total: 4 })}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {/* Patient */}
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t('patientLabel')}</span>
              {selectedPatient && (
                <button onClick={() => setCurrentStep(1)} className="text-[#1570EF] hover:underline capitalize font-semibold shadow-none">
                  {t('editBtn')}
                </button>
              )}
            </div>
            <div className="text-[14px] font-bold text-slate-900">
              {selectedPatient ? selectedPatient.fullName : <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>}
            </div>
          </div>

          {/* Service */}
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t('serviceLabel')}</span>
              {selectedService && (
                <button onClick={() => setCurrentStep(2)} className="text-[#1570EF] hover:underline capitalize font-semibold shadow-none">
                  {t('changeBtn')}
                </button>
              )}
            </div>
            <div className="text-[14px] font-bold text-slate-900">
              {selectedService ? selectedService.name : <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>}
            </div>
          </div>

          {/* Doctor */}
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t('doctorLabel')}</span>
              {selectedDoctor && (
                <button onClick={() => setCurrentStep(3)} className="text-[#1570EF] hover:underline capitalize font-semibold shadow-none">
                  {t('changeBtn')}
                </button>
              )}
            </div>
            <div className="text-[14px] font-bold text-slate-900">
              {selectedDoctor ? selectedDoctor.fullName : <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>}
            </div>
          </div>

          {/* Schedule */}
          <div className="flex flex-col gap-1 pb-2">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{isWalkIn ? t('walkInTypeLabel') : t('scheduledForLabel')}</span>
              {isWalkIn ? (
                <QueueIcon size={16} className="text-[#16a34a]" />
              ) : (
                <CalendarBlankIcon size={16} className="text-[#1570EF]" />
              )}
            </div>
            <div className={`text-[14px] font-bold ${isWalkIn ? 'text-[#16a34a]' : 'text-[#1570EF]'}`}>
              {isWalkIn ? (
                t('walkInQueueTime')
              ) : selectedSlot ? (
                t('scheduledAt', { date: format(selectedDate, 'dd/MM/yyyy'), time: selectedSlot })
              ) : (
                <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mt-2">
            <span className="text-[14px] text-slate-500 font-medium">{t('serviceFee')}</span>
            <span className="text-2xl font-bold text-slate-900">
              {selectedService?.price ? `${Number(selectedService.price).toLocaleString()} VNĐ` : '0 VNĐ'}
            </span>
          </div>

          <button
            onClick={handleSubmitBooking}
            disabled={isSubmitting || !canSubmit}
            className="w-full h-12 bg-[#1570EF] text-white rounded-[12px] text-[15px] font-bold hover:bg-[#0F5ED4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_12px_rgb(21,112,239,0.2)] mt-1 cursor-pointer"
          >
            {isSubmitting ? (
              <SpinnerIcon className="animate-spin" />
            ) : (
              isWalkIn ? t('confirmWalkIn') : t('confirmBtn')
            )}
            {!isSubmitting && <CaretRightIcon size={20} weight="bold" />}
          </button>

          <p className="text-[10px] text-slate-400 text-center mt-3 px-4 leading-relaxed font-medium">
            {t('notice')}
          </p>
        </div>
      </div>
    </div>
  );
}
