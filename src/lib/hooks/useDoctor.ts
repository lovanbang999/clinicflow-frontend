'use client';

import { useState, useEffect } from 'react';
import { doctorsApi } from '@/lib/api/doctors';
import { Doctor } from '@/types';
import { toast } from 'sonner';

export function useDoctor(id: string) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Using the api client getById endpoint
        const data = await doctorsApi.getById(id);
        setDoctor(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch doctor';
        setError(errorMessage);
        toast.error('Lỗi', {
          description: 'Không thể tải thông tin bác sĩ',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void fetchDoctor();
    }
  }, [id]);

  return { doctor, isLoading, error };
}
