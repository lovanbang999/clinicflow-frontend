'use client';

import { useState, useCallback, useEffect } from 'react';
import { medicalRecordsApi, PatientHistoryResponse } from '@/lib/api/medical-records';
import { useApiHandler } from './useApiHandler';

export function usePatientHistory(patientProfileId?: string) {
  const [history, setHistory] = useState<PatientHistoryResponse | null>(null);
  const { execute, isLoading, error } = useApiHandler();

  const fetchHistory = useCallback(async () => {
    if (!patientProfileId) return;

    await execute(
      async () => {
        const data = await medicalRecordsApi.getPatientHistory(patientProfileId);
        setHistory(data);
      },
      {
        errorFallbackMsg: 'Error fetching patient records'
      }
    );
  }, [patientProfileId, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
