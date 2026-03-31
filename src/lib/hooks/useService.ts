'use client';

import { useState, useEffect } from 'react';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/types/service';
import { useApiHandler } from './useApiHandler';

export function useService(id: string) {
  const [service, setService] = useState<Service | null>(null);
  const { execute, isLoading, error } = useApiHandler();

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      await execute(
        async () => {
          const data = await servicesApi.getById(id);
          setService(data);
        },
        {
          errorFallbackMsg: 'Lỗi',
        }
      );
    };

    const timer = setTimeout(() => {
      void fetchService();
    }, 0);
    return () => clearTimeout(timer);
  }, [id, execute]);

  return { service, isLoading, error };
}
