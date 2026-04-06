import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types';

export interface AdminRoom {
  id: string;
  name: string;
  type: string;
}

export const adminRoomsApi = {
  /**
   * Fetch all active rooms for scheduling
   */
  getRooms: async (): Promise<AdminRoom[]> => {
    const res = await apiClient.get<ApiResponse<{ data: AdminRoom[] }>>('/admin/schedules/rooms');
    if (!res.data.data) {
      throw new Error('Failed to fetch rooms');
    }
    return res.data.data.data;
  },
};
