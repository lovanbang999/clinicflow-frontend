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
        errorFallbackMsg: 'Không thể tải thông tin bác sĩ',
        onError: (err) => setError(err.message || 'Failed to fetch doctor')
      }
    );
    if (data) setDoctor(data);
  }, [id, execute]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  return { doctor, isLoading, error: error || (apiError ? 'Error' : null) };
}
