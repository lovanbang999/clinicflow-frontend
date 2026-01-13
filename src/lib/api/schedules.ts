import { apiClient } from './client';
import {
  TimeSlot,
  AvailableSlotsQuery,
  SmartSuggestion,
  SmartSuggestionsQuery,
  WorkingHours,
  BreakTime,
  OffDay,
} from '@/types';

export const schedulesApi = {
  // Get available time slots
  getAvailableSlots: async (params: AvailableSlotsQuery): Promise<TimeSlot[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { availableSlots: string[]; total: number };
    }>('/schedules/available-slots', { params });
    
    // Transform string array to TimeSlot format
    return response.data.data.availableSlots.map(time => ({
      time,
      available: true,
      availableSlots: 1,
      maxSlots: 1,
    }));
  },

  // Get smart suggestions
  getSmartSuggestions: async (params: SmartSuggestionsQuery): Promise<SmartSuggestion[]> => {
    const response = await apiClient.get<{ suggestions: SmartSuggestion[]; totalFound: number }>('/suggestions/smart', { params });
    return response.data.suggestions;
  },

  // Get doctor working hours
  getDoctorWorkingHours: async (doctorId: string): Promise<WorkingHours[]> => {
    const response = await apiClient.get<WorkingHours[]>(`/schedules/doctor/${doctorId}/working-hours`);
    return response.data;
  },

  // Set working hours (admin/doctor)
  setWorkingHours: async (data: Omit<WorkingHours, 'id'>): Promise<WorkingHours> => {
    const response = await apiClient.post<WorkingHours>('/schedules/working-hours', data);
    return response.data;
  },

  // Add break time
  addBreakTime: async (data: Omit<BreakTime, 'id'>): Promise<BreakTime> => {
    const response = await apiClient.post<BreakTime>('/schedules/break-times', data);
    return response.data;
  },

  // Add off day
  addOffDay: async (data: Omit<OffDay, 'id'>): Promise<OffDay> => {
    const response = await apiClient.post<OffDay>('/schedules/off-days', data);
    return response.data;
  },
};
