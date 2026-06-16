import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types';

export interface AdminDashboardOverview {
  totalUsers: number;
  totalDoctors: number;
  totalBookings: number;
  totalRevenue: number;
  revenueByType?: {
    CONSULTATION: number;
    SERVICE: number;
    PHARMACY: number;
  };
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
  revenue?: number;
}

export interface TopServiceItem {
  id: string;
  name: string;
  bookingsCount: number;
  estimatedRevenue: number;
}

export interface BookingOverview {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  inProgress: number;
  completedPct: number;
  upcomingPct: number;
  cancelledPct: number;
}

export interface DateRange {
  from?: string;
  to?: string;
}

export const dashboardApi = {
  // Stats (Overview)
  getAdminStats: async (range?: DateRange): Promise<AdminDashboardOverview> => {
    const response = await apiClient.get<ApiResponse<AdminDashboardOverview>>('/admin/analytics/overview', {
      params: range,
    });
    if (!response.data.data) throw new Error('Failed to fetch admin stats overview');
    return response.data.data;
  },

  // Revenue Chart
  getAdminRevenueChart: async (period?: 'week' | 'month' | 'quarter', range?: DateRange): Promise<RevenueChartItem[]> => {
    const response = await apiClient.get<ApiResponse<{ chart: RevenueChartItem[] }>>('/admin/analytics/revenue-chart', {
      params: { ...range, period },
    });
    if (!response.data.data) throw new Error('Failed to fetch revenue chart');
    return response.data.data.chart;
  },

  // Top Doctors
  getAdminTopDoctors: async (range?: DateRange, limit?: number): Promise<TopDoctorItem[]> => {
    const response = await apiClient.get<ApiResponse<{ topDoctors: TopDoctorItem[] }>>('/admin/analytics/top-doctors', {
      params: { ...range, limit },
    });
    if (!response.data.data) throw new Error('Failed to fetch top doctors');
    return response.data.data.topDoctors;
  },

  // Top Services
  getAdminTopServices: async (range?: DateRange, limit?: number): Promise<TopServiceItem[]> => {
    const response = await apiClient.get<ApiResponse<{ topServices: TopServiceItem[] }>>('/admin/analytics/top-services', {
      params: { ...range, limit },
    });
    if (!response.data.data) throw new Error('Failed to fetch top services');
    return response.data.data.topServices;
  },

  // Booking Overview (Status Chart)
  getBookingOverview: async (range?: DateRange): Promise<BookingOverview> => {
    const response = await apiClient.get<ApiResponse<BookingOverview>>('/admin/analytics/booking-overview', {
      params: range,
    });
    if (!response.data.data) throw new Error('Failed to fetch booking overview');
    return response.data.data;
  },

  // Revenue Report
  getRevenueReport: async (range?: DateRange): Promise<RevenueReportData> => {
    const response = await apiClient.get<ApiResponse<RevenueReportData>>('/admin/analytics/revenue-report', {
      params: range,
    });
    if (!response.data.data) throw new Error('Failed to fetch revenue report');
    return response.data.data;
  },
};

export interface RevenueReportInvoice {
  id: string;
  invoiceNumber: string;
  invoiceType: string;
  totalAmount: number;
  paidAt: string;
  patientName: string;
  patientCode: string;
  doctorName: string;
  paymentMethod: string;
}

export interface RevenueReportData {
  summary: {
    totalRevenue: number;
    invoiceCount: number;
    averageOrderValue: number;
    revenueByType: {
      CONSULTATION: number;
      SERVICE: number;
      PHARMACY: number;
    };
    paymentMethodRevenue: {
      CASH: number;
      CARD: number;
      BANK_TRANSFER: number;
      INSURANCE: number;
    };
  };
  invoices: RevenueReportInvoice[];
}
