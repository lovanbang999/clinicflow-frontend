'use client';

import { useState, useEffect } from 'react';
import {
  analyticsApi,
  MonthlyTrendItem,
  DiseaseItem,
  SpendingData,
} from '@/lib/api/admin/analytics';

export function usePatientVisitTrend() {
  const [data, setData] = useState<MonthlyTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getPatientVisitTrend()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function usePatientTopDiseases() {
  const [data, setData] = useState<DiseaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getPatientTopDiseases()
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function usePatientTotalSpending() {
  const [data, setData] = useState<SpendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getPatientTotalSpending()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}
