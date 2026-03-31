'use client';

import { useState, useEffect } from 'react';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/types/service';
import { useApiHandler } from './useApiHandler';

interface UseServicesParams {
  isActive?: boolean;
  search?: string;
}

export function useServices(params: UseServicesParams = {}) {
  const { isActive, search } = params;
  const [services, setServices] = useState<Service[]>([]);
  const { execute, isLoading, error } = useApiHandler();

  useEffect(() => {
    const fetchServices = async () => {
      await execute(
        async () => {
          const data = await servicesApi.getAll({ isActive, search });
          setServices(data);
        },
        {
          errorFallbackMsg: 'Lỗi',
        }
      );
    };

    const timer = setTimeout(() => {
      void fetchServices();
    }, 0);
    return () => clearTimeout(timer);
  }, [isActive, search, execute]);

  return { services, isLoading, error };
}
