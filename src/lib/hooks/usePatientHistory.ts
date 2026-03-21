'use client';

import { useState, useCallback, useEffect } from 'react';
import { medicalRecordsApi, PatientHistoryResponse } from '@/lib/api/medical-records';
import { toast } from 'sonner';

export function usePatientHistory(patientProfileId?: string) {
  const [history, setHistory] = useState<PatientHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!patientProfileId) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await medicalRecordsApi.getPatientHistory(patientProfileId);
      setHistory(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch patient history';
      setError(msg);
      toast.error('Error fetching patient records', { description: msg });
    } finally {
      setIsLoading(false);
    }
  }, [patientProfileId]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}
