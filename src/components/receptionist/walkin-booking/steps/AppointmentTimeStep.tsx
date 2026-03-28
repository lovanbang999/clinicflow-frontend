'use client';

import { useTranslations } from 'next-intl';
import { useWalkinBooking } from '../WalkinBookingContext';
import { CalendarBlankIcon, QueueIcon, ClockIcon, SpinnerIcon } from '@phosphor-icons/react';
import { format, addDays, startOfToday } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import { useLocale } from 'next-intl';

export function AppointmentTimeStep() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.time');
  const locale = useLocale();
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    getStepNumberClass,
    availableSlots,
    isLoadingSlots,
    selectedSlot,
    selectSlot,
    bookingType,
    setBookingType,
    selectedDate,
    setSelectedDate,
    selectedDoctor,
  } = useWalkinBooking();

  // Build next 14 days for quick date picker
  const today = startOfToday();
  const dateOptions = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const formatDisplayDate = (date: Date) =>
    format(date, 'd/MM', { locale: locale === 'vi' ? viLocale : undefined });

  const formatDayLabel = (date: Date) => {
    const day = format(date, 'EEE', { locale: locale === 'vi' ? viLocale : undefined });
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const isToday = (date: Date) => format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  const isSelected = (date: Date) => format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

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

          {currentStep === 4 && (
            <div className="space-y-5">
              {/* Booking Type Toggle */}
              <div className="flex gap-3">
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
                    <p className="font-bold leading-tight">{t('walkInLabel')}</p>
                    <p className="text-[11px] font-normal opacity-70 mt-0.5">{t('walkInDesc')}</p>
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
                    <p className="font-bold leading-tight">{t('preBookingLabel')}</p>
                    <p className="text-[11px] font-normal opacity-70 mt-0.5">{t('preBookingDesc')}</p>
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
                <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-[#f0fdf4] border border-[#86efac]/60 text-sm text-[#16a34a]">
                  <QueueIcon size={18} weight="fill" className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{t('walkInQueueLabel')}</p>
                    <p className="text-[12px] opacity-75 mt-0.5">{t('walkInQueueDesc')}</p>
                  </div>
                </div>
              )}

              {/* Date picker (only for pre-booking) */}
              {bookingType === 'PRE_BOOKING' && (
                <div className="space-y-4">
                  {/* Horizontal date scroll */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                      <CalendarBlankIcon size={16} />
                      <p className="text-sm font-medium">{t('dateLabel')}</p>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                      {dateOptions.map((date) => (
                        <button
                          key={format(date, 'yyyy-MM-dd')}
                          onClick={() => setSelectedDate(date)}
                          className={`flex flex-col items-center shrink-0 snap-start w-[62px] py-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                            isSelected(date)
                              ? 'border-[#1570EF] bg-[#1570EF] text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <p className={`text-[10px] font-bold uppercase mb-1 ${isSelected(date) ? 'text-blue-100' : 'text-slate-400'}`}>
                            {isToday(date) ? t('today') : formatDayLabel(date)}
                          </p>
                          <p className="text-[15px] font-extrabold leading-none">{formatDisplayDate(date)}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                      <ClockIcon size={16} />
                      <p className="text-sm font-medium">{t('selectSlotLabel')}</p>
                    </div>

                    {!selectedDoctor ? (
                      <p className="text-sm text-slate-400 italic">{t('selectDoctorFirst')}</p>
                    ) : isLoadingSlots ? (
                      <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                        <SpinnerIcon size={16} className="animate-spin" />
                        <span>{t('loadingSlots')}</span>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="py-5 px-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-sm text-slate-400 font-medium">{t('noSlotsAvailable')}</p>
                        <p className="text-[11px] text-slate-300 mt-1">{t('noSlotsDesc')}</p>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-w-[500px]">
                        {availableSlots.map((slot: string) => {
                          const isSlotSelected = selectedSlot === slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => selectSlot(slot)}
                              className={`w-[70px] h-10 rounded-lg text-[13px] font-bold transition-colors border-2 cursor-pointer ${
                                isSlotSelected
                                  ? 'border-[#1570EF] bg-white text-[#1570EF]'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-[#1570EF]/50'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep > 4 && (
            <div className="text-sm font-medium text-slate-900 flex items-center gap-2 border border-slate-200 rounded-lg p-3 w-max pr-8 shadow-sm">
              {bookingType === 'WALK_IN' ? (
                <><QueueIcon size={16} className="text-[#16a34a]" /><span className="font-bold text-[#16a34a]">{t('walkInLabel')}</span></>
              ) : (
                <><CalendarBlankIcon size={16} className="text-[#1570EF]" /><span className="font-bold">{selectedSlot}</span></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
