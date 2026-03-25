import { apiClient } from './client';
import { ApiResponse } from '@/types';

export interface AdminStatsResponse {
  appointments: { value: number; trend: number };
  revenue: { value: number; trend: number };
  newPatients: { value: number; trend: number };
}

export interface RevenueChartItem {
  date: string;
  revenue: number;
}

export interface TopDoctorItem {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  patientsCount: number;
}

export interface TopServiceItem {
  id: string;
  name: string;
  bookingsCount: number;
  estimatedRevenue: number;
}

export const dashboardApi = {
  // Stats
  getAdminStats: async (): Promise<AdminStatsResponse> => {
    const response = await apiClient.get<ApiResponse<AdminStatsResponse>>('/admin/dashboard/stats');
    if (!response.data.data) throw new Error('Failed to fetch admin stats');
    return response.data.data;
  },

  // Revenue Chart
  getAdminRevenueChart: async (period: 'week' | 'month' | 'quarter'): Promise<RevenueChartItem[]> => {
    const response = await apiClient.get<ApiResponse<RevenueChartItem[]>>('/admin/dashboard/revenue-chart', {
      params: { period },
    });
    if (!response.data.data) throw new Error('Failed to fetch revenue chart');
    return response.data.data;
  },

  // Top Doctors
  getAdminTopDoctors: async (): Promise<TopDoctorItem[]> => {
    const response = await apiClient.get<ApiResponse<TopDoctorItem[]>>('/admin/dashboard/top-doctors');
    if (!response.data.data) throw new Error('Failed to fetch top doctors');
    return response.data.data;
  },

  // Top Services
  getAdminTopServices: async (): Promise<TopServiceItem[]> => {
    const response = await apiClient.get<ApiResponse<TopServiceItem[]>>('/admin/dashboard/top-services');
    if (!response.data.data) throw new Error('Failed to fetch top services');
    return response.data.data;
  },
};
