import { apiClient } from './client';
import {
  ApiResponse,
  DashboardData,
  AdminDashboardData,
  AdminDashboardStats,
  MonthlyStats,
  TopDoctor,
  RevenueChartData,
  BookingOverviewData,
} from '@/types';

export const dashboardApi = {
  // Patient dashboard
  getPatientStats: async (): Promise<DashboardData> => {
    const response = await apiClient.get<ApiResponse<DashboardData>>(
      '/bookings/dashboard/stats',
    );
    if (!response.data.data) throw new Error('Failed to fetch dashboard stats');
    return response.data.data;
  },

  // Admin — legacy combined endpoint (kept for backwards-compat)
  getAdminStats: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
      '/admin/dashboard/stats',
    );
    if (!response.data.data)
      throw new Error('Failed to fetch admin dashboard stats');
    return response.data.data;
  },

  // Admin — GET /admin/dashboard/overview
  getAdminOverview: async (): Promise<AdminDashboardStats> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardStats>>(
      '/admin/dashboard/overview',
    );
    if (!response.data.data)
      throw new Error('Failed to fetch admin overview');
    return response.data.data;
  },

  // Admin — GET /admin/dashboard/monthly-stats?month=YYYY-MM
  getAdminMonthlyStats: async (month?: string): Promise<MonthlyStats> => {
    const params = month ? { month } : {};
    const response = await apiClient.get<ApiResponse<MonthlyStats>>(
      '/admin/dashboard/monthly-stats',
      { params },
    );
    if (!response.data.data)
      throw new Error('Failed to fetch monthly stats');
    return response.data.data;
  },

  // Admin — GET /admin/dashboard/top-doctors?limit=N
  getAdminTopDoctors: async (limit: number = 5): Promise<TopDoctor[]> => {
    const response = await apiClient.get<ApiResponse<{ topDoctors: TopDoctor[] }>>(
      '/admin/dashboard/top-doctors',
      { params: { limit } },
    );
    if (!response.data.data)
      throw new Error('Failed to fetch top doctors');
    return response.data.data.topDoctors;
  },

  // Admin — GET /admin/dashboard/revenue-chart?months=N
  getAdminRevenueChart: async (months: number = 6): Promise<RevenueChartData> => {
    const response = await apiClient.get<ApiResponse<RevenueChartData>>(
      '/admin/dashboard/revenue-chart',
      { params: { months } },
    );
    if (!response.data.data)
      throw new Error('Failed to fetch revenue chart');
    return response.data.data;
  },

  // Admin — GET /admin/dashboard/booking-overview
  getAdminBookingOverview: async (): Promise<BookingOverviewData> => {
    const response = await apiClient.get<ApiResponse<BookingOverviewData>>(
      '/admin/dashboard/booking-overview',
    );
    if (!response.data.data)
      throw new Error('Failed to fetch booking overview');
    return response.data.data;
  },
};
