'use client';

import { useState, useEffect } from 'react';
import {
  analyticsApi,
  MonthlyTrendItem,
  DiseaseItem,
  BookingStatusItem,
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
