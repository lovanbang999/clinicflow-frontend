'use client';

import { useState, useCallback } from 'react';
import { medicalRecordsApi, ICD10Record, CreateMedicalRecordDto, SaveSymptomsDto, SaveDiagnosisDto, CreatePrescriptionDto } from '@/lib/api/clinical/medical-records';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

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

/**
 * Hook for saving ICD-10 diagnosis and treatment plan
 */
export function useSaveDiagnosis() {
  const { execute, isLoading } = useApiHandler();

  const saveDiagnosis = useCallback(async (bookingId: string, data: SaveDiagnosisDto) => {
    return execute(
      async () => {
        const result = await medicalRecordsApi.saveDiagnosis(bookingId, data);
        return result;
      },
      {
        errorFallbackMsg: 'saveDiagnosisError'
      }
    );
  }, [execute]);

  return {
    isSaving: isLoading,
    saveDiagnosis,
  };
}

/**
 * Hook for saving prescription
 */
export function useSavePrescription() {
  const { execute, isLoading } = useApiHandler();

  const savePrescription = useCallback(async (bookingId: string, data: CreatePrescriptionDto) => {
    return execute(
      async () => {
        const result = await medicalRecordsApi.savePrescription(bookingId, data);
        return result;
      },
      {
        errorFallbackMsg: 'savePrescriptionError'
      }
    );
  }, [execute]);

  return {
    isSaving: isLoading,
    savePrescription,
  };
}
