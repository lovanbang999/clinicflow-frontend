'use client';

import { useState, useEffect, useCallback } from 'react';
import { doctorsApi } from '@/lib/api/doctors';
import { Doctor } from '@/types';
import { useApiHandler } from './useApiHandler';

export function useDoctor(id: string) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const { execute, isLoading, error: apiError } = useApiHandler();
  const [error, setError] = useState<string | null>(null);

  const fetchDoctor = useCallback(async () => {
    if (!id) return;
    
    setError(null);
    const data = await execute(
      () => doctorsApi.getById(id),
      { 
        errorFallbackMsg: 'fetchDoctorInfoError',
        onError: (err) => setError(err.message || 'Failed to fetch doctor')
      }
    );
    if (data) setDoctor(data);
  }, [id, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctor();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDoctor]);

  return { 
    doctor, 
    isLoading, 
    error: error || (apiError ? (apiError.message || 'Error') : null) 
  };
}
