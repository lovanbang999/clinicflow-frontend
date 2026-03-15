'use client';

import { useState, useEffect } from 'react';
import { doctorsApi } from '@/lib/api/doctors';
import { Doctor } from '@/types/doctor';
import { toast } from 'sonner';

// Only params supported by GET /users/public/doctors backend endpoint
interface UseDoctorsParams {
  serviceId?: string;
  page?: number;
  limit?: number;
}

export function useDoctors(params?: UseDoctorsParams) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await doctorsApi.getAll(params);
        setDoctors(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch doctors';
        setError(errorMessage);
        toast.error('Lỗi', {
          description: 'Không thể tải danh sách bác sĩ',
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.serviceId]);

  return { doctors, isLoading, error };
}