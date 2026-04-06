import { apiClient } from '@/lib/api/core/client';

export interface MonthlyTrendItem {
  month: string; // e.g. "2026-01"
  count: number;
}

export interface DiseaseItem {
  code: string | null;
  name: string;
  count: number;
}

export interface SpendingData {
  total: number;
  thisYear: number;
}

export interface BookingStatusItem {
  status: 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  count: number;
}

export const analyticsApi = {
  // Patient
  getPatientVisitTrend: async (): Promise<MonthlyTrendItem[]> => {
    const res = await apiClient.get('/analytics/patient/me/visit-trend');
    return res.data.data;
  },
  getPatientTopDiseases: async (): Promise<DiseaseItem[]> => {
    const res = await apiClient.get('/analytics/patient/me/top-diseases');
    return res.data.data;
  },
  getPatientTotalSpending: async (): Promise<SpendingData> => {
    const res = await apiClient.get('/analytics/patient/me/total-spending');
    return res.data.data;
  },

  // Doctor
  getDoctorTopDiagnoses: async (): Promise<DiseaseItem[]> => {
    const res = await apiClient.get('/analytics/doctor/me/top-diagnoses');
    return res.data.data;
  },
  getDoctorBookingStatus: async (): Promise<BookingStatusItem[]> => {
    const res = await apiClient.get('/analytics/doctor/me/booking-status');
    return res.data.data;
  },
  getDoctorPatientsPerMonth: async (): Promise<MonthlyTrendItem[]> => {
    const res = await apiClient.get('/analytics/doctor/me/patients-per-month');
    return res.data.data;
  },
};
