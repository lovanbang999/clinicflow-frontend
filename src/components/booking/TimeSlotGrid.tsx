'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Loader2, Sun, Sunset } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';
import { schedulesApi } from '@/lib/api/appointment/schedules';
import { usersApi } from '@/lib/api/auth/users';
import { formatDate } from 'date-fns';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotGridProps {
  onSelect?: (timeSlot: string) => void;
}

export function TimeSlotGrid({ onSelect }: TimeSlotGridProps) {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { selectedTimeSlot, setSelectedTimeSlot, selectedDate, selectedDoctor, selectedService } = useBookingStore();
  const t = useTranslations('booking');

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !selectedDoctor || !selectedService) {
        setTimeSlots([]);
        return;
      }

      try {
        setLoading(true);
        
        // Format date as YYYY-MM-DD
        const dateStr = formatDate(selectedDate, 'yyyy-MM-dd');
        
        let profileId = user?.patientProfile?.id;

        if (!profileId && user) {
          try {
            const profile = await usersApi.getMyProfile();
            useAuthStore.getState().setUser(profile);
            profileId = profile.patientProfile?.id;
          } catch (err) {
            console.error('Failed to fetch profile in TimeSlotGrid:', err);
          }
        }

        if (!profileId) {
          toast.error(t('loginRequired'));
          setTimeSlots([]);
          // router.push('/login'); // Avoid forcing navigation if just browsing as guest, wait, TimeSlotGrid should just show empty or default?
          // Actually, if we require login to see slots, pushing to login is somewhat jarring but let's keep it consistent.
          router.push('/login');
          return;
        }

        // Fetch available slots from API
        const slots = await schedulesApi.getAvailableSlots({
          doctorId: selectedDoctor.id,
          patientId: user?.id, // Backend expects patientId (userId)
          date: dateStr,
          serviceId: selectedService.id,
        });

        // Transform API response to TimeSlot format
        const transformedSlots = slots.map(slot => ({
          time: slot.time,
          available: slot.available,
        }));

        setTimeSlots(transformedSlots);
      } catch (error) {
        console.error('Failed to fetch time slots:', error);
        // Generate default slots if API fails
        setTimeSlots(generateDefaultTimeSlots());
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [router, selectedDate, selectedDoctor, selectedService, user, user?.patientProfile?.id, t]);

  const generateDefaultTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8; // 8 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          time,
          available: Math.random() > 0.3, // Randomly mark some as unavailable
        });
      }
    }

    return slots;
  };

  const handleTimeSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    setSelectedTimeSlot(slot.time);
    onSelect?.(slot.time);
  };

  if (!selectedDate || !selectedDoctor || !selectedService) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700">
        <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t('selectDateAndDoctor')}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto flex items-center justify-center py-24 bg-white dark:bg-slate-900/50 rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700">
        <Clock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t('noTimeSlotsAvailable')}</p>
      </div>
    );
  }

  // Group time slots by time period
  const morningSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour < 12;
  });

  const afternoonSlots = timeSlots.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0]);
    return hour >= 12;
  });

  const renderSlots = (slots: TimeSlot[], title: string, isMorning: boolean) => (
    <div className="mb-10 last:mb-0">
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
          isMorning ? "bg-amber-50 dark:bg-amber-500/10" : "bg-indigo-50 dark:bg-indigo-500/10"
        )}>
          {isMorning ? (
            <Sun className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
          ) : (
            <Sunset className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {slots.map((slot) => {
          const isSelected = selectedTimeSlot === slot.time;

          return (
            <button
              key={slot.time}
              onClick={() => handleTimeSlotClick(slot)}
              disabled={!slot.available}
              className={cn(
                'px-4 py-3.5 rounded-[16px] text-sm font-bold transition-all duration-300 cursor-pointer',
                'flex items-center justify-center shadow-sm',
                // Available & Unselected
                slot.available && !isSelected && 'bg-white dark:bg-slate-900/50 border-2 border-slate-100/80 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-none hover:-translate-y-1 hover:text-blue-600 text-slate-700 dark:text-slate-300',
                // Selected
                slot.available && isSelected && 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 border-2 border-blue-500 scale-105 hover:bg-blue-600',
                // Unavailable
                !slot.available && 'bg-slate-50 dark:bg-slate-800/30 border-2 border-transparent text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60 shadow-none'
              )}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900/50 rounded-[32px] border-2 border-slate-100/80 dark:border-slate-800 p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
      {morningSlots.length > 0 && renderSlots(morningSlots, t('morningSlots'), true)}
      {morningSlots.length > 0 && afternoonSlots.length > 0 && (
        <div className="w-full h-px bg-slate-100/80 dark:bg-slate-800 my-8"></div>
      )}
      {afternoonSlots.length > 0 && renderSlots(afternoonSlots, t('afternoonSlots'), false)}
    </div>
  );
}
