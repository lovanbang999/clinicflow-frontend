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

export interface DoctorSummary {
  total: number;
  deltaTotal: number;
  completed: number;
  deltaCompleted: number;
  absentCancel: number;
  deltaAbsentCancel: number;
  sourceBreakdown: { online: number; walkIn: number; phone: number };
  avgMinutes: number;
  rating: number;
}

export interface RecentPatient {
  id: string;
  bookingDate: string;
  startTime: string;
  status: string;
  patientProfile: { fullName: string; patientCode: string } | null;
  service: { name: string } | null;
  medicalRecord: { diagnosisName: string | null } | null;
}

export interface TodayAppointment {
  id: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  source: string | null;
  patientProfile: { fullName: string } | null;
  service: { name: string } | null;
}

export interface ClinicalKPIsData {
  avgWaitMinutes: number;
  returnRate: number;
  labOrderRate: number;
  icdUsageRate: number;
  newPatientRate: number;
  followUpRate: number;
  meta: { totalBookings: number; totalRecords: number; periodMonths: number };
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
  getDoctorSummary: async (period = 'month'): Promise<DoctorSummary> => {
    const res = await apiClient.get(`/analytics/doctor/me/summary?period=${period}`);
    return res.data.data;
  },
  getDoctorRecentPatients: async (): Promise<RecentPatient[]> => {
    const res = await apiClient.get('/analytics/doctor/me/recent-patients');
    return res.data.data;
  },
  getDoctorTodaySchedule: async (): Promise<TodayAppointment[]> => {
    const res = await apiClient.get('/analytics/doctor/me/today-schedule');
    return res.data.data;
  },
  getDoctorHeatmap: async (): Promise<number[][]> => {
    const res = await apiClient.get('/analytics/doctor/me/heatmap');
    return res.data.data;
  },
  getDoctorClinicalKPIs: async (): Promise<ClinicalKPIsData> => {
    const res = await apiClient.get('/analytics/doctor/me/clinical-kpis');
    return res.data.data;
  },
};
