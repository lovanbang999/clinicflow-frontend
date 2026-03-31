'use client';

import { useState, useEffect } from 'react';
import { doctorsApi } from '@/lib/api/doctors';
import { Doctor } from '@/types/doctor';
import { useApiHandler } from './useApiHandler';

// Only params supported by GET /users/public/doctors backend endpoint
interface UseDoctorsParams {
  serviceId?: string;
  page?: number;
  limit?: number;
}

export function useDoctors(params?: UseDoctorsParams) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const { execute, isLoading, error } = useApiHandler();

  useEffect(() => {
    const fetchDoctors = async () => {
      await execute(
        async () => {
          const data = await doctorsApi.getAll(params);
          setDoctors(data);
        },
        { errorFallbackMsg: 'fetchDoctorsErrorVi' }
      );
    };

    const timer = setTimeout(() => {
      void fetchDoctors();
    }, 0);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.serviceId, execute]);

  return { doctors, isLoading, error };
}