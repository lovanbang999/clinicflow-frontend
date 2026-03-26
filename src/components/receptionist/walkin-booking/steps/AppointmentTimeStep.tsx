'use client';

import { useTranslations } from 'next-intl';
import { useWalkinBooking } from '../WalkinBookingContext';
import { CalendarBlankIcon, QueueIcon, ClockIcon } from '@phosphor-icons/react';

export function AppointmentTimeStep() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.time');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    getStepNumberClass,
    availableSlots,
    selectedSlot,
    selectSlot,
    bookingType,
    setBookingType,
  } = useWalkinBooking();

  return (
    <div className={`relative pb-6 ${!isStepDone(3) && currentStep !== 4 ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start gap-4">
        <div
          className={`w-8 h-8 rounded-full border-2 text-[13px] font-bold flex items-center justify-center shrink-0 z-10 transition-colors ${getStepNumberClass(4)} ${currentStep > 4 ? 'cursor-pointer hover:shadow-md' : ''}`}
          onClick={() => { if (currentStep > 4) setCurrentStep(4); }}
        >
          4
        </div>
        <div className="flex-1 pt-1.5">
          <div
            className={`mb-5 ${currentStep > 4 ? 'cursor-pointer hover:opacity-80 inline-block transition-opacity' : ''}`}
            onClick={() => { if (currentStep > 4) setCurrentStep(4); }}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('title')}</h3>
            <p className="text-sm text-slate-500 mb-0">{t('desc')}</p>
          </div>

          {/* Booking Type Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setBookingType('WALK_IN')}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                bookingType === 'WALK_IN'
                  ? 'border-[#1570EF] bg-[#eff6ff] text-[#1570EF]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <QueueIcon size={20} weight={bookingType === 'WALK_IN' ? 'fill' : 'regular'} />
              <div className="text-left">
                <p className="font-bold leading-tight">Đến trực tiếp</p>
                <p className="text-[11px] font-normal opacity-70 mt-0.5">Vào hàng đợi, không cần đặt giờ</p>
              </div>
              {bookingType === 'WALK_IN' && (
                <div className="ml-auto w-4 h-4 rounded-full bg-[#1570EF] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>

            <button
              onClick={() => setBookingType('PRE_BOOKING')}
              className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                bookingType === 'PRE_BOOKING'
                  ? 'border-[#1570EF] bg-[#eff6ff] text-[#1570EF]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
              }`}
            >
              <CalendarBlankIcon size={20} weight={bookingType === 'PRE_BOOKING' ? 'fill' : 'regular'} />
              <div className="text-left">
                <p className="font-bold leading-tight">Đặt trước</p>
                <p className="text-[11px] font-normal opacity-70 mt-0.5">Chọn khung giờ cụ thể</p>
              </div>
              {bookingType === 'PRE_BOOKING' && (
                <div className="ml-auto w-4 h-4 rounded-full bg-[#1570EF] flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          </div>

          {/* Walk-in info banner */}
          {bookingType === 'WALK_IN' && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#f0fdf4] border border-[#86efac]/60 text-sm text-[#16a34a] mb-2">
              <QueueIcon size={18} weight="fill" className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Bệnh nhân sẽ vào hàng chờ ngay sau khi check-in</p>
                <p className="text-[12px] opacity-75 mt-0.5">
                  Thời gian ước tính sẽ được cập nhật tự động dựa trên lịch bác sĩ hôm nay.
                </p>
              </div>
            </div>
          )}

          {/* Time slot picker (only for pre-booking) */}
          {bookingType === 'PRE_BOOKING' && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-slate-500">
                <ClockIcon size={16} />
                <p className="text-sm font-medium">Chọn khung giờ</p>
              </div>
              <div className="flex flex-wrap gap-2 max-w-[500px]">
                {availableSlots.map((slot: string) => {
                  const isSelected = selectedSlot === slot;
                  const isDisabled = slot === '09:00' || slot === '10:30'; // Mock disabled
                  return (
                    <button
                      key={slot}
                      disabled={isDisabled}
                      onClick={() => selectSlot(slot)}
                      className={`w-[70px] h-10 rounded-lg text-[13px] font-bold transition-colors border-2 ${
                        isSelected
                          ? 'border-[#1570EF] bg-white text-[#1570EF]'
                          : isDisabled
                          ? 'border-transparent bg-slate-50 text-slate-300 cursor-not-allowed'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-[#1570EF]/50 cursor-pointer'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
