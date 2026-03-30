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

export interface AffectedAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  serviceName: string;
  startTime: string;
  status: string;
}

export interface CreateOffDayResult extends OffDay {
  affectedAppointments: AffectedAppointment[];
  cancelledCount?: number;
}

export interface PreviewOffDayResult {
  affectedAppointments: AffectedAppointment[];
}

export const schedulesApi = {
  // Get available time slots
  getAvailableSlots: async (params: AvailableSlotsQuery): Promise<TimeSlot[]> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { availableSlots: string[]; total: number };
    }>('/schedules/available-slots', { params });
    
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

  // Working Hours

  // Get working hours for a doctor (uses the correct backend path)
  getWorkingHours: async (doctorId: string): Promise<WorkingHours[]> => {
    const response = await apiClient.get<{ data: WorkingHours[] }>(`/schedules/working-hours/${doctorId}`);
    return response.data.data;
  },

  // Save (create or update) working hours for one day
  saveWorkingHours: async (data: Omit<WorkingHours, 'id'>): Promise<WorkingHours> => {
    const response = await apiClient.post<{ data: WorkingHours }>('/schedules/working-hours', data);
    return response.data.data;
  },

  // Delete working hours for a specific day
  deleteWorkingHours: async (doctorId: string, dayOfWeek: string): Promise<void> => {
    await apiClient.delete(`/schedules/working-hours/${doctorId}/${dayOfWeek}`);
  },

  // Bulk update working hours
  bulkUpdateWorkingHours: async (data: {
    doctorId: string;
    items: {
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      enabled: boolean;
    }[];
  }): Promise<WorkingHours[]> => {
    const response = await apiClient.post<{ data: WorkingHours[] }>(
      '/schedules/working-hours/bulk',
      data,
    );
    return response.data.data;
  },

  // Off Days

  // Get off days for a doctor
  getOffDays: async (doctorId: string, startDate?: string, endDate?: string): Promise<OffDay[]> => {
    const response = await apiClient.get<{ data: OffDay[] }>(`/schedules/off-days/${doctorId}`, {
      params: { startDate, endDate },
    });
    return response.data.data;
  },

  // Preview affected appointments (no off day is created)
  previewOffDay: async (doctorId: string, date: string): Promise<PreviewOffDayResult> => {
    const response = await apiClient.get<{ data: PreviewOffDayResult }>('/schedules/off-days/preview', {
      params: { doctorId, date },
    });
    return response.data.data;
  },

  // Create an off day (returns affected appointments; optionally cancels them)
  createOffDay: async (data: Omit<OffDay, 'id'> & { cancelAffected?: boolean }): Promise<CreateOffDayResult> => {
    const response = await apiClient.post<{ data: CreateOffDayResult }>('/schedules/off-days', data);
    return response.data.data;
  },

  // Delete off day by doctorId + date
  deleteOffDay: async (doctorId: string, date: string): Promise<void> => {
    await apiClient.delete(`/schedules/off-days/${doctorId}/${date}`);
  },

  // Break Times

  // Add break time
  addBreakTime: async (data: Omit<BreakTime, 'id'>): Promise<BreakTime> => {
    const response = await apiClient.post<BreakTime>('/schedules/break-times', data);
    return response.data;
  },

  // Legacy aliases kept for backward compatibility
  getDoctorWorkingHours: async (doctorId: string): Promise<WorkingHours[]> => {
    return schedulesApi.getWorkingHours(doctorId);
  },

  setWorkingHours: async (data: Omit<WorkingHours, 'id'>): Promise<WorkingHours> => {
    return schedulesApi.saveWorkingHours(data);
  },

  addOffDay: async (data: Omit<OffDay, 'id'>): Promise<CreateOffDayResult> => {
    return schedulesApi.createOffDay(data);
  },
};
