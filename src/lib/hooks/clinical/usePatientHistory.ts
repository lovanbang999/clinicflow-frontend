'use client';

import { useState, useCallback, useEffect } from 'react';
import { medicalRecordsApi, type PatientHistoryResponse } from '@/lib/api/clinical/medical-records';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export function usePatientHistory(patientProfileId?: string) {
  const [history, setHistory] = useState<PatientHistoryResponse | null>(null);
  const { execute, isLoading, error } = useApiHandler();

  const fetchHistory = useCallback(async (page = 1) => {
    if (!patientProfileId) return;

    await execute(
      async () => {
        const data = await medicalRecordsApi.getPatientHistory(patientProfileId, page, 50);
        setHistory(data);
      },
      {
        errorFallbackMsg: 'fetchPatientRecordsError'
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
