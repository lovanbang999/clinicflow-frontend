'use client';

import { useState, useCallback } from 'react';
import { medicalRecordsApi, ICD10Record, CreateMedicalRecordDto, SaveSymptomsDto } from '@/lib/api/medical-records';
import { useApiHandler } from './useApiHandler';

/**
 * Hook for searching ICD-10 medical codes
 */
export function useIcd10Search() {
  const [results, setResults] = useState<ICD10Record[]>([]);
  const { execute, isLoading } = useApiHandler();

  const search = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    await execute(
      async () => {
        const data = await medicalRecordsApi.searchICD10(query);
        setResults(data);
      },
      {
        errorFallbackMsg: 'searchIcd10Error',
        showErrorToast: false // Match old behaviour, just console error if needed, but we'll let it toast since it's an API error
      }
    );
  }, [execute]);

  return {
    results,
    isSearching: isLoading,
    search,
    setResults,
  };
}

/**
 * Hook for medical record actions (upsert, etc.)
 */
export function useMedicalRecordActions() {
  const { execute, isLoading } = useApiHandler();

  const upsertRecord = useCallback(async (data: CreateMedicalRecordDto) => {
    return execute(
      async () => {
        const result = await medicalRecordsApi.upsertMedicalRecord(data);
        return result;
      },
      {
        errorFallbackMsg: 'upsertMedicalRecordError'
      }
    );
  }, [execute]);

  return {
    isPerformingAction: isLoading,
    upsertRecord,
  };
}

/**
 * Hook for saving clinical symptoms and vitals
 */
export function useSaveSymptoms() {
  const { execute, isLoading } = useApiHandler();

  const saveSymptoms = useCallback(async (bookingId: string, data: SaveSymptomsDto) => {
    return execute(
      async () => {
        const result = await medicalRecordsApi.saveSymptoms(bookingId, data);
        return result;
      },
      {
        errorFallbackMsg: 'saveSymptomsError'
      }
    );
  }, [execute]);

  return {
    isSaving: isLoading,
    saveSymptoms,
  };
}
