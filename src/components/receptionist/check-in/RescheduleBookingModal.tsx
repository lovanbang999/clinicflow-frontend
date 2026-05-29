'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { format, parseISO } from 'date-fns';
import {
  CalendarBlankIcon,
  CaretDownIcon,
  ClockIcon,
  UserCircleIcon,
  XIcon,
  ArrowRightIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Booking } from '@/types';
import { schedulesApi } from '@/lib/api/appointment/schedules';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface DoctorOption {
  id: string;
  fullName: string;
}

interface RescheduleBookingModalProps {
  isOpen: boolean;
  booking: Booking | null;
  doctors: DoctorOption[];
  onClose: () => void;
  onConfirm: (data: {
    doctorId: string;
    bookingDate: string;
    startTime: string;
    notes: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function RescheduleBookingModal({
  isOpen,
  booking,
  doctors,
  onClose,
  onConfirm,
  isSubmitting,
}: RescheduleBookingModalProps) {
  const t = useTranslations('receptionistCheckIn.rescheduleModal');
  
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);

  // Pre-fill fields when booking is loaded
  useEffect(() => {
    if (booking && isOpen) {
      setSelectedDoctorId(booking.doctor?.id || '');
      setSelectedDate(booking.bookingDate ? parseISO(booking.bookingDate) : new Date());
      setSelectedSlot(booking.startTime || null);
      setNotes('');
    }
  }, [booking, isOpen]);

  // Fetch slots whenever doctor or date changes
  const fetchSlots = useCallback(async () => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }
    
    setIsLoadingSlots(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slots = await schedulesApi.getAvailableSlots({
        doctorId: selectedDoctorId,
        date: dateStr,
      });
      setAvailableSlots(slots);
      
      // If previous slot is still available, keep it selected. Otherwise reset.
      const isStillAvailable = slots.find(s => s.time === selectedSlot && s.available);
      if (!isStillAvailable) {
        setSelectedSlot(null);
      }
    } catch (err) {
      console.error('[fetchSlots]', err);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDoctorId, selectedDate, selectedSlot]);

  useEffect(() => {
    if (isOpen && selectedDoctorId && selectedDate) {
      void fetchSlots();
    }
  }, [selectedDoctorId, selectedDate, isOpen, fetchSlots]);

  if (!isOpen || !booking) return null;

  const handleConfirm = async () => {
    if (!selectedDoctorId || !selectedDate || !selectedSlot) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    await onConfirm({
      doctorId: selectedDoctorId,
      bookingDate: formattedDate,
      startTime: selectedSlot,
      notes: notes.trim(),
    });
  };

  const bookingCode = booking.bookingCode ?? `#${booking.id.slice(0, 6).toUpperCase()}`;
  const initials = (booking.patientProfile?.fullName ?? '??')
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
    
  const oldFormattedTime = booking.startTime ? `${booking.startTime}` : '—';
  const oldFormattedDate = booking.bookingDate
    ? format(parseISO(booking.bookingDate), 'EEEE, MMM dd, yyyy')
    : '—';
  
  const selectedDoctorName = doctors.find(d => d.id === selectedDoctorId)?.fullName || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] transition-transform duration-300 transform scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <CalendarBlankIcon size={22} weight="bold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{t('title')}</h3>
              <p className="text-xs text-slate-400 font-medium">#{bookingCode} • {booking.patientProfile?.fullName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section: Current Appointment Details */}
          <div className="border border-slate-100 bg-slate-50/55 rounded-2xl p-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 shrink-0">
              {t('appointmentDetails')}
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1570EF]/10 text-[#1570EF] flex items-center justify-center font-bold text-sm uppercase shrink-0">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">{booking.patientProfile?.fullName}</p>
                  <p className="text-xs text-slate-500">{booking.service?.name}</p>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end text-sm text-slate-600 font-semibold bg-white border border-slate-100 rounded-xl px-3.5 py-2.5 shadow-sm">
                <p className="text-[#1570EF] flex items-center gap-1.5">
                  <ClockIcon size={16} weight="bold" />
                  {oldFormattedTime}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">{oldFormattedDate}</p>
              </div>
            </div>
          </div>

          {/* Icon indicator down */}
          <div className="flex justify-center -my-3">
            <div className="size-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm shrink-0">
              <ArrowRightIcon size={16} className="rotate-90" />
            </div>
          </div>

          {/* Section: Reschedule form */}
          <div className="space-y-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 shrink-0">
              {t('newScheduleTitle')}
            </p>

            {/* Doctor & Date Inputs side by side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Doctor Selection */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase">{t('doctorLabel')}</label>
                <button
                  type="button"
                  onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 transition-colors w-full cursor-pointer text-left shadow-sm"
                >
                  <UserCircleIcon size={18} className="text-slate-400 shrink-0" />
                  <span className="truncate flex-1">
                    {selectedDoctorName || t('selectDoctorFirst')}
                  </span>
                  <CaretDownIcon size={16} className="text-slate-400 shrink-0 ml-auto" />
                </button>

                {isDoctorDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden shrink-0">
                    <div className="max-h-56 overflow-y-auto">
                      {doctors.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => {
                            setSelectedDoctorId(doc.id);
                            setIsDoctorDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                            selectedDoctorId === doc.id
                              ? 'bg-[#1570EF]/5 text-[#1570EF] font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {doc.fullName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">{t('dateLabel')}</label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2.5 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 transition-colors w-full cursor-pointer text-left shadow-sm"
                    >
                      <CalendarBlankIcon size={18} className="text-slate-400 shrink-0" />
                      <span className="truncate flex-1">
                        {selectedDate
                          ? format(selectedDate, 'EEEE, MMM dd, yyyy')
                          : t('selectDateFirst')}
                      </span>
                      <CaretDownIcon size={16} className="text-slate-400 shrink-0 ml-auto" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 shadow-lg border border-slate-200 rounded-xl overflow-hidden z-50"
                    align="start"
                    sideOffset={6}
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d) => {
                        setSelectedDate(d);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                      disabled={(date) => {
                        // Cannot select past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

            </div>

            {/* Time Slot Grid */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('slotLabel')}</label>
              
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-400 font-medium gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                  <span>{t('loadingSlots')}</span>
                </div>
              ) : !selectedDoctorId || !selectedDate ? (
                <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 text-xs font-semibold rounded-xl border border-amber-100">
                  <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
                  <span>{t('selectDoctorFirst')}</span>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="flex items-center gap-2 p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-100">
                  <WarningCircleIcon size={16} weight="fill" className="shrink-0" />
                  <span>{t('noSlots')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[140px] overflow-y-auto pr-1 p-0.5">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    const isDisabled = !slot.available && !isSelected;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all text-center cursor-pointer border ${
                          isSelected
                            ? 'bg-[#1570EF] text-white border-[#1570EF] shadow-sm scale-[1.02]'
                            : isDisabled
                            ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-60'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reschedule Reason Notes */}
            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('notesLabel')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1570EF] focus:ring-1 focus:ring-[#1570EF] resize-none text-sm placeholder:text-slate-400 text-slate-900 transition-colors shadow-inner"
              />
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex items-center gap-3 shrink-0 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDoctorId || !selectedDate || !selectedSlot || isSubmitting}
            className="flex-1 px-5 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm text-sm"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>...</span>
              </span>
            ) : (
              t('confirmBtn')
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
