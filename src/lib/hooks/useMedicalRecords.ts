'use client';

import { useState, useCallback } from 'react';
import { medicalRecordsApi, ICD10Record, CreateMedicalRecordDto } from '@/lib/api/medical-records';

/**
 * Hook for searching ICD-10 medical codes
 */
export function useIcd10Search() {
  const [results, setResults] = useState<ICD10Record[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const data = await medicalRecordsApi.searchICD10(query);
      setResults(data);
    } catch (error) {
      console.error('Error searching ICD-10:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    results,
    isSearching,
    search,
    setResults,
  };
}

/**
 * Hook for medical record actions (upsert, etc.)
 */
export function useMedicalRecordActions() {
  const [isPerformingAction, setIsPerformingAction] = useState(false);

  const upsertRecord = useCallback(async (data: CreateMedicalRecordDto) => {
    try {
      setIsPerformingAction(true);
      const result = await medicalRecordsApi.upsertMedicalRecord(data);
      return result;
    } catch (error) {
      console.error('Error upserting medical record:', error);
      throw error;
    } finally {
      setIsPerformingAction(false);
    }
  }, []);

  return {
    isPerformingAction,
    upsertRecord,
  };
}
