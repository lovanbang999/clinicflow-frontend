import { apiClient } from './client';
import {
  AdminScheduleStats,
  AdminScheduleSlot,
  AdminCreateScheduleDto,
  AdminUpdateScheduleDto,
  AdminScheduleFilters,
  AdminScheduleListResponse,
  ApiResponse,
} from '@/types';

export const adminSchedulesApi = {
  // Get schedules list (filtered)
  getSchedules: async (filters: AdminScheduleFilters): Promise<AdminScheduleListResponse> => {
    const response = await apiClient.get<ApiResponse<AdminScheduleListResponse>>('/admin/schedules', {
        params: filters,
      });

      if (!response.data.data) {
        throw new Error('Failed to fetch schedules');
      }

      return response.data.data;
},

  // Get schedule statistics
  getStatistics: async (): Promise<AdminScheduleStats> => {
    const response = await apiClient.get<ApiResponse<AdminScheduleStats>>('/admin/schedules/statistics');

      if (!response.data.data) {
        throw new Error('Failed to fetch schedule statistics');
      }

      return response.data.data;
},

  // Get schedule by ID
  getScheduleById: async (id: string): Promise<AdminScheduleSlot> => {
    const response = await apiClient.get<ApiResponse<AdminScheduleSlot>>(`/admin/schedules/${id}`);

      if (!response.data.data) {
        throw new Error('Failed to fetch schedule');
      }

      return response.data.data;
},

  // Create a new schedule
  createSchedule: async (data: AdminCreateScheduleDto): Promise<AdminScheduleSlot> => {
    const response = await apiClient.post<ApiResponse<AdminScheduleSlot>>('/admin/schedules', data);

      if (!response.data.data) {
        throw new Error('Failed to create schedule');
      }

      return response.data.data;
},

  // Update a schedule
  updateSchedule: async (id: string, data: AdminUpdateScheduleDto): Promise<AdminScheduleSlot> => {
    const response = await apiClient.patch<ApiResponse<AdminScheduleSlot>>(`/admin/schedules/${id}`, data);

      if (!response.data.data) {
        throw new Error('Failed to update schedule');
      }

      return response.data.data;
},

  // Soft delete (suspend) schedule
  deleteSchedule: async (id: string): Promise<AdminScheduleSlot> => {
    const response = await apiClient.delete<ApiResponse<AdminScheduleSlot>>(`/admin/schedules/${id}`);
      
      if (!response.data.data) {
        throw new Error('Failed to delete schedule');
      }
      
      return response.data.data;
},

  // Restore deleted schedule
  restoreSchedule: async (id: string): Promise<AdminScheduleSlot> => {
    const response = await apiClient.patch<ApiResponse<AdminScheduleSlot>>(`/admin/schedules/${id}/restore`);
      
      if (!response.data.data) {
        throw new Error('Failed to restore schedule');
      }

      return response.data.data;
},
};
