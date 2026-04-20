'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useWalkinBooking } from '../WalkinBookingContext';
import {
  CalendarCheckIcon,
  CalendarBlankIcon,
  QueueIcon,
} from '@phosphor-icons/react';

export function BookingSummaryCard() {
  const t = useTranslations('receptionistWalkinBooking.summary');
  const tTime = useTranslations('receptionistWalkinBooking.time');
  const tDoctor = useTranslations('receptionistWalkinBooking.doctor');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    selectedPatient,
    selectedDoctor,
    selectedDate,
    selectedSlot,
    bookingType,
  } = useWalkinBooking();

  const isWalkIn = bookingType === 'WALK_IN';

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

        {/* Progress Bar — 3 steps: BN → BS → Thời gian */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1570EF] transition-all duration-300 rounded-full"
                style={{
                  width: `${(isStepDone(1) ? 34 : 0) + (isStepDone(2) ? 33 : 0) + (isStepDone(3) ? 33 : 0)}%`,
                }}
              />
            </div>
            <span className="text-[11px] font-bold text-[#1570EF] uppercase shrink-0">
              {t('stepProgress', { current: Math.min(currentStep, 3), total: 3 })}
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

          {/* Doctor — Mô hình A: service to be set by doctor later */}
          <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{t('doctorLabel')}</span>
              {selectedDoctor && (
                <button onClick={() => setCurrentStep(3)} className="text-[#1570EF] hover:underline capitalize font-semibold shadow-none">
                  {t('changeBtn')}
                </button>
              )}
            </div>
            <div className="text-[14px] font-bold text-slate-900 flex flex-col gap-0.5">
              {selectedDoctor ? (
                <>
                  <span>{selectedDoctor.fullName}</span>
                  <span className="text-[12px] text-blue-600 font-bold">
                    {tDoctor('consultationFee')}: {selectedDoctor.consultationFee && Number(selectedDoctor.consultationFee) > 0 
                      ? `${Number(selectedDoctor.consultationFee).toLocaleString('vi-VN')} ₫`
                      : tDoctor('free')}
                  </span>
                </>
              ) : (
                <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>
              )}
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

        {/* Note about Model A flow */}
        <div className="mt-4 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
            {t('modelANote')}
          </p>
        </div>
      </div>
    </div>
  );
}
