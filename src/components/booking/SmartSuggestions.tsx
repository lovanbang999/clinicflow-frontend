'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Clock, TrendingUp } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';
import { schedulesApi } from '@/lib/api/schedules';
import { SmartSuggestion } from '@/types';
import { formatDate } from '@/lib/utils/formatters';

export function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedDoctor, selectedService, setSelectedDate, setSelectedTimeSlot, setCurrentStep } = useBookingStore();

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
    <Card className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Gợi ý thông minh</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Những khung giờ tối ưu dựa trên lịch trình của bác sĩ
      </p>

      <div className="grid gap-3">
        {suggestions.map((suggestion) => (
          <div
            key={`${suggestion.date}-${suggestion.time}`}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">
                    {formatDate(suggestion.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {suggestion.time} - {suggestion.availableSlots} chỗ trống
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="shrink-0 cursor-pointer"
            >
              Chọn ngay
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
