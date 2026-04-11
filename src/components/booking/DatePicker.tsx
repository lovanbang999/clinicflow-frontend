'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/lib/store/bookingStore';
import { SmartSuggestions } from './SmartSuggestions';
import { useTranslations } from 'next-intl';

interface DatePickerProps {
  onSelect?: (date: Date) => void;
}

export function DatePicker({ onSelect }: DatePickerProps) {
  const t = useTranslations('booking.datePicker');
  const WEEKDAYS = t.raw('weekdays') as string[];
  const MONTHS = t.raw('months') as string[];

  const { selectedDate, setSelectedDate } = useBookingStore();
  const [currentMonth, setCurrentMonth] = useState(selectedDate ? new Date(selectedDate) : new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    // Don't allow selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) return;

    setSelectedDate(newDate);
    onSelect?.(newDate);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: (number | null)[] = [
    ...Array(startingDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 px-2 sm:px-0">
      {/* Calendar Container */}
      <div className="w-full max-w-[340px] sm:max-w-md xl:w-[420px] bg-white dark:bg-slate-900/50 rounded-[16px] md:rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-4 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handlePreviousMonth}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-500 rounded-2xl transition-colors active:scale-95"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {MONTHS[month]} {year}
            </h2>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-blue-500 rounded-2xl transition-colors active:scale-95"
            aria-label="Next month"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }

            const date = new Date(year, month, day);
            date.setHours(0, 0, 0, 0);
            const isPast = date < today;
            const isToday = date.getTime() === today.getTime();
            const isSelected = selectedDate &&
              date.getTime() === new Date(selectedDate).setHours(0, 0, 0, 0);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={isPast}
                className={cn(
                  'aspect-square rounded-[14px] text-sm font-semibold transition-all duration-300',
                  'flex items-center justify-center',
                  // Disabled / Past dates
                  isPast && 'text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50',
                  // Normal dates
                  !isPast && !isSelected && !isToday && 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-500 hover:scale-105',
                  // Today (unselected)
                  isToday && !isSelected && 'border-2 border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-500/20',
                  // Selected
                  isSelected && 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105 hover:bg-blue-600 font-bold'
                )}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Legend / Status Indicators */}
        <div className="pt-6 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"></div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('selected')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10"></div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('today')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700"></div>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{t('past')}</span>
          </div>
        </div>
      </div>

      {/* Suggestions Container */}
      <div className="w-full max-w-md xl:w-[420px] mx-auto xl:mx-0 shrink-0">
        <SmartSuggestions />
      </div>
    </div>
  );
}
