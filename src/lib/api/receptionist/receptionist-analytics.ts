import axiosClient from '@/lib/api/core/client';
import { ApiResponse } from '@/types';

export type DateRange = {
  from?: string;
  to?: string;
};

export type ReceptionistOverview = {
  totalRevenue: number;
  checkIns: number;
  newPatients: number;
  pendingInvoices: number;
};

export type RevenueTrendItem = {
  date: string;
  revenue: number;
};

export type OperationalStats = {
  bookingSources: { label: string; value: number }[];
  appointmentStatuses: { label: string; value: number }[];
  paymentMethods: { label: string; value: number; count: number }[];
  topServices: { name: string; count: number; revenue: number }[];
};

export const receptionistAnalyticsApi = {
  getOverview: async (range?: DateRange): Promise<ReceptionistOverview> => {
    const response = await axiosClient.get<ApiResponse<ReceptionistOverview>>('/receptionist/analytics/overview', { params: range });
    if (!response.data.data) throw new Error('Failed to fetch overview');
    return response.data.data;
  },

  getRevenueTrend: async (range?: DateRange): Promise<RevenueTrendItem[]> => {
    const response = await axiosClient.get<ApiResponse<{ chart: RevenueTrendItem[] }>>('/receptionist/analytics/revenue-trend', { params: range });
    if (!response.data.data) throw new Error('Failed to fetch revenue trend');
    return response.data.data.chart;
  },

  getOperationalStats: async (range?: DateRange): Promise<OperationalStats> => {
    const response = await axiosClient.get<ApiResponse<OperationalStats>>('/receptionist/analytics/operational', { params: range });
    if (!response.data.data) throw new Error('Failed to fetch operational stats');
    return response.data.data;
  },
};
