'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { useWalkinBooking } from '../WalkinBookingContext';
import {
  CalendarCheckIcon,
  CalendarBlankIcon,
  QueueIcon,
  TestTubeIcon,
  FlaskIcon,
} from '@phosphor-icons/react';

export function BookingSummaryCard() {
  const t = useTranslations('receptionistWalkinBooking.summary');
  const tTime = useTranslations('receptionistWalkinBooking.time');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    bookingMode,
    selectedPatient,
    selectedDoctor,
    selectedServices,
    dutyDoctor,
    selectedDate,
    selectedSlot,
    bookingType,
  } = useWalkinBooking();

  const isWalkIn = bookingType === 'WALK_IN';
  const isModeB = bookingMode === 'DIRECT_SERVICE';

  const totalAmount = selectedServices.reduce((sum, s) => sum + Number(s.price ?? 0), 0);

  const accentColor = '#1570EF';
  const accentBorderHex = '#1570EF';
  const accentText = 'text-[#1570EF]';
  const accentBgClass = 'bg-[#eff6ff]';

  return (
    <div className="w-full lg:w-[360px] shrink-0">
      <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-6 sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarCheckIcon style={{ color: accentColor }} size={22} weight="fill" />
            <h2 className="text-[17px] font-bold text-slate-900">{t('title')}</h2>
          </div>
          {isWalkIn ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f0fdf4] text-[#16a34a] text-[11px] font-bold border border-[#86efac]/60">
              <QueueIcon size={12} weight="fill" />
              {tTime('walkInLabel')}
            </span>
          ) : (
            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${accentBgClass} ${accentText} text-[11px] font-bold border`} style={{ borderColor: accentBorderHex + '99' }}>
              <CalendarBlankIcon size={12} weight="fill" />
              {tTime('preBookingLabel')}
            </span>
          )}
        </div>

        {/* Mode B badge */}
        {isModeB && (
          <div className="mb-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF4FF] border border-[#1570EF]/20">
            <FlaskIcon size={13} className="text-[#1570EF]" weight="fill" />
            <span className="text-[11px] font-bold text-[#1570EF]">Đặt thẳng dịch vụ · B3→B4</span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${(isStepDone(1) ? 34 : 0) + (isStepDone(2) ? 33 : 0) + (isStepDone(3) ? 33 : 0)}%`,
                  backgroundColor: accentColor,
                }}
              />
            </div>
            <span className="text-[11px] font-bold uppercase shrink-0" style={{ color: accentColor }}>
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
                <button onClick={() => setCurrentStep(1)} style={{ color: accentColor }} className="hover:underline capitalize font-semibold shadow-none">
                  {t('editBtn')}
                </button>
              )}
            </div>
            <div className="text-[14px] font-bold text-slate-900">
              {selectedPatient ? selectedPatient.fullName : <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>}
            </div>
          </div>

          {/* Mode A: Doctor */}
          {!isModeB && (
            <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{t('doctorLabel')}</span>
                {selectedDoctor && (
                  <button onClick={() => setCurrentStep(2)} className="text-[#1570EF] hover:underline capitalize font-semibold shadow-none">
                    {t('changeBtn')}
                  </button>
                )}
              </div>
              <div className="text-[14px] font-bold text-slate-900 flex flex-col gap-0.5">
                {selectedDoctor ? (
                  <>
                    <span>{selectedDoctor.fullName}</span>
                    <span className="text-[12px] text-blue-600 font-bold">
                      Phí khám: {selectedDoctor.consultationFee && Number(selectedDoctor.consultationFee) > 0
                        ? `${Number(selectedDoctor.consultationFee).toLocaleString('vi-VN')} ₫`
                        : 'Miễn phí'}
                    </span>
                  </>
                ) : <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>}
              </div>
            </div>
          )}

          {/* Mode B: Services */}
          {isModeB && (
            <>
              <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-100">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>{t('modeBServicesLabel')}</span>
                  {selectedServices.length > 0 && (
                    <button onClick={() => setCurrentStep(2)} className="text-[#1570EF] hover:underline capitalize font-semibold shadow-none">
                      {t('changeBtn')}
                    </button>
                  )}
                </div>
                {selectedServices.length === 0 ? (
                  <span className="text-slate-300 italic font-normal text-[14px]">{t('notSelected')}</span>
                ) : (
                  <div className="space-y-1">
                    {selectedServices.map(svc => (
                      <div key={svc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TestTubeIcon size={11} className="text-[#1570EF] shrink-0" />
                          <span className="text-[13px] font-medium text-slate-800">{svc.name}</span>
                        </div>
                        <span className="text-[12px] font-bold text-slate-600 shrink-0">
                          {svc.price && Number(svc.price) > 0 ? `${Number(svc.price).toLocaleString('vi-VN')} ₫` : 'Miễn phí'}
                        </span>
                      </div>
                    ))}
                    {totalAmount > 0 && (
                      <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-slate-100">
                        <span className="text-[12px] font-bold text-slate-700">{t('modeBTotalLabel')}</span>
                        <span className="text-[14px] font-black text-[#1570EF]">
                          {totalAmount.toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Duty Doctor */}
              <div className="flex flex-col gap-1 pb-4 border-b border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('modeBDutyDoctorLabel')}
                </div>
                <div className="text-[14px] font-bold text-slate-900 flex flex-col gap-0.5">
                  {dutyDoctor ? (
                    <>
                      <span>{dutyDoctor.fullName}</span>
                      <span className="text-[11px] text-[#1570EF] font-bold">{t('modeBDutyDoctorNote')}</span>
                    </>
                  ) : <span className="text-slate-300 italic font-normal">{t('notSelected')}</span>}
                </div>
              </div>
            </>
          )}

          {/* Schedule */}
          <div className="flex flex-col gap-1 pb-2">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>{isWalkIn ? t('walkInTypeLabel') : t('scheduledForLabel')}</span>
              {isWalkIn ? (
                <QueueIcon size={16} className="text-[#16a34a]" />
              ) : (
                <CalendarBlankIcon size={16} style={{ color: accentColor }} />
              )}
            </div>
            <div className={`text-[14px] font-bold ${isWalkIn ? 'text-[#16a34a]' : accentText}`}>
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

        {/* Bottom Note */}
        <div
          className="mt-4 px-4 py-3.5 rounded-xl border"
          style={{ backgroundColor: isModeB ? '#EFF4FF' : '#fffbeb', borderColor: isModeB ? '#1570EF30' : '#fde68a' }}
        >
          <p className="text-[11px] leading-relaxed font-medium" style={{ color: isModeB ? '#1e40af' : '#92400e' }}>
            {isModeB ? t('modeBNote') : t('modelANote')}
          </p>
        </div>
      </div>
    </div>
  );
}
