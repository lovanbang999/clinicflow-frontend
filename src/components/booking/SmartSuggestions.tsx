'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';
import { schedulesApi } from '@/lib/api/appointment/schedules';
import { SmartSuggestion } from '@/types';
import { formatDate } from '@/lib/utils/formatters';
import { useTranslations } from 'next-intl';

export function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedDoctor, selectedService, setSelectedDate, setSelectedTimeSlot, setCurrentStep } = useBookingStore();
  const t = useTranslations('booking.smartSuggestions');

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!selectedDoctor || !selectedService) {
        setSuggestions([]);
        return;
      }

      try {
        setLoading(true);
        
        // Get suggestions for the next 7 days
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 7);

        const data = await schedulesApi.getSmartSuggestions({
          doctorId: selectedDoctor.id,
          serviceId: selectedService.id,
          startDate: formatDate(today, 'yyyy-MM-dd'),
          endDate: formatDate(endDate, 'yyyy-MM-dd'),
          limit: 3,
        });

        setSuggestions(data);
      } catch (error) {
        console.error('Failed to fetch smart suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [selectedDoctor, selectedService]);

  const handleSelectSuggestion = (suggestion: SmartSuggestion) => {
    const date = new Date(suggestion.date);
    setSelectedDate(date);
    setSelectedTimeSlot(suggestion.time);
    setCurrentStep(5); // Skip to confirmation
  };

  if (!selectedDoctor || !selectedService || loading || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-linear-to-br from-indigo-50 dark:from-indigo-900/20 w-full to-blue-50/80 dark:to-blue-900/20 rounded-[16px] md:rounded-[32px] border-2 border-indigo-100/50 dark:border-indigo-500/20 p-4 sm:p-8 shadow-xl shadow-indigo-100/40 dark:shadow-none">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="font-bold text-xl text-slate-900 dark:text-white">{t('title')}</h3>
          <p className="text-sm font-semibold text-indigo-600/80 dark:text-indigo-400 mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={`${suggestion.date}-${suggestion.time}`}
            onClick={() => handleSelectSuggestion(suggestion)}
            className="group relative bg-white dark:bg-slate-900/50 rounded-[24px] border-2 border-white dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-200/40 dark:hover:shadow-none transition-all duration-300 cursor-pointer flex items-center justify-between hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 md:w-12 md:h-12 md:rounded-[16px] rounded-[8px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 group-hover:bg-indigo-500 transition-colors duration-300">
                <TrendingUp className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors duration-300" strokeWidth={2.5} />
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {formatDate(suggestion.date)}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                    {suggestion.time}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {t('slotsLeft', { slots: suggestion.availableSlots })}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors duration-300">
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600" strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
