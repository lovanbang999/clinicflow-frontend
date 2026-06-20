'use client';

import { useState, useEffect } from 'react';
import {
  analyticsApi,
  MonthlyTrendItem,
  DiseaseItem,
  BookingStatusItem,
  DoctorSummary,
  RecentPatient,
  TodayAppointment,
  ClinicalKPIsData,
  ServiceTrendItem,
  WeeklyTrendItem,
} from '@/lib/api/admin/analytics';

export function useDoctorTopDiagnoses() {
  const [data, setData] = useState<DiseaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorTopDiagnoses()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorBookingStatus() {
  const [data, setData] = useState<BookingStatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorBookingStatus()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorPatientsPerMonth() {
  const [data, setData] = useState<MonthlyTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorPatientsPerMonth()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorSummary(period: string) {
  const [data, setData] = useState<DoctorSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    analyticsApi.getDoctorSummary(period)
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => { if (!cancelled) setData(null); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; setIsLoading(true); };
  }, [period]);

  return { data, isLoading };
}



export function useDoctorRecentPatients() {
  const [data, setData] = useState<RecentPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorRecentPatients()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorTodaySchedule() {
  const [data, setData] = useState<TodayAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorTodaySchedule()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorHeatmap() {
  // Default: 24 hours × 7 days, all zeros
  const [data, setData] = useState<number[][]>(
    Array.from({ length: 24 }, () => Array(7).fill(0) as number[]),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorHeatmap()
      .then(setData)
      .catch(() => setData(Array.from({ length: 24 }, () => Array(7).fill(0) as number[])))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorClinicalKPIs() {
  const [data, setData] = useState<ClinicalKPIsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorClinicalKPIs()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorTopServices() {
  const [data, setData] = useState<ServiceTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorTopServices()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useDoctorWeeklyBookings() {
  const [data, setData] = useState<WeeklyTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getDoctorWeeklyBookings()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}
