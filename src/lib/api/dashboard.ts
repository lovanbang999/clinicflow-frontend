import { apiClient } from './client';
import { ApiResponse, DashboardData } from '@/types';

export const dashboardApi = {
  // Get patient dashboard stats
  getPatientStats: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      '/bookings/dashboard/stats',
    );

    if (!response.data.data) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return response.data.data;
  },
};
