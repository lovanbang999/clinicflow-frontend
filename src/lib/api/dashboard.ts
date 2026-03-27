import { apiClient } from './client';
import { ApiResponse } from '@/types';

export interface AdminDashboardOverview {
  totalUsers: number;
  totalDoctors: number;
  totalBookings: number;
  totalRevenue: number;
  trends: {
    newPatientsThisMonth: number;
    newPatientsLastMonth: number;
    newBookingsThisMonth: number;
    newBookingsLastMonth: number;
    currentMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowthPct: number;
  };
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
  // Stats (Overview)
  getAdminStats: async (): Promise<AdminDashboardOverview> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardOverview>>('/admin/dashboard/overview');
    if (!response.data.data) throw new Error('Failed to fetch admin dashboard overview');
    return response.data.data;
  },

  // Revenue Chart
  getAdminRevenueChart: async (period: 'week' | 'month' | 'quarter'): Promise<RevenueChartItem[]> => {
    const response = await apiClient.get<ApiResponse<{ chart: RevenueChartItem[] }>>('/admin/dashboard/revenue-chart', {
      params: { period },
    });
    if (!response.data.data) throw new Error('Failed to fetch revenue chart');
    return response.data.data.chart;
  },

  // Top Doctors
  getAdminTopDoctors: async (): Promise<TopDoctorItem[]> => {
    const response = await apiClient.get<ApiResponse<{ topDoctors: TopDoctorItem[] }>>('/admin/dashboard/top-doctors');
    if (!response.data.data) throw new Error('Failed to fetch top doctors');
    return response.data.data.topDoctors;
  },

  // Top Services
  getAdminTopServices: async (): Promise<TopServiceItem[]> => {
    const response = await apiClient.get<ApiResponse<{ topServices: TopServiceItem[] }>>('/admin/dashboard/top-services');
    if (!response.data.data) throw new Error('Failed to fetch top services');
    return response.data.data.topServices;
  },
};
