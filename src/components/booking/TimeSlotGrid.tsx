'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Clock, Loader2 } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';
import { schedulesApi } from '@/lib/api/schedules';
import { formatDate } from 'date-fns';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
        
        if (!user?.id) {
          toast.error('Vui lòng đăng nhập để xem khung giờ khả dụng');
          setTimeSlots([]);
          router.push('/login');
          return;
        }

        // Fetch available slots from API
        const slots = await schedulesApi.getAvailableSlots({
          doctorId: selectedDoctor.id,
          patientId: user.id,
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
  }, [router, selectedDate, selectedDoctor, selectedService, user?.id]);

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
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Vui lòng chọn ngày và bác sĩ trước</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Không có khung giờ nào khả dụng</p>
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

  const renderSlots = (slots: TimeSlot[], title: string) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        {title}
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedTimeSlot === slot.time;

          return (
            <button
              key={slot.time}
              onClick={() => handleTimeSlotClick(slot)}
              disabled={!slot.available}
              className={cn(
                'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                'flex items-center justify-center',
                slot.available && !isSelected && 'bg-white border border-gray-200 hover:border-primary hover:bg-primary/5 text-gray-900',
                slot.available && isSelected && 'bg-primary text-white shadow-lg scale-105 border-2 border-primary',
                !slot.available && 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
    <div className="space-y-6">
      {morningSlots.length > 0 && renderSlots(morningSlots, 'Buổi sáng')}
      {afternoonSlots.length > 0 && renderSlots(afternoonSlots, 'Buổi chiều')}
    </div>
  );
}
