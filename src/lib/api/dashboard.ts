import { apiClient } from './client';
import { ApiResponse, DashboardData, AdminDashboardData } from '@/types';

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

  // Get admin dashboard stats
  getAdminStats: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
      '/admin/dashboard/stats',
    );

    if (!response.data.data) {
      throw new Error('Failed to fetch admin dashboard stats');
    }

    return response.data.data;
  },
};
