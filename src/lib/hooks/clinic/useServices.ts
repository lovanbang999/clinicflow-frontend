'use client';

import { useState, useEffect } from 'react';
import { servicesApi } from '@/lib/api/clinic/services';
import { Service } from '@/types/service';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

interface UseServicesParams {
  isActive?: boolean;
  search?: string;
  categoryType?: 'EXAMINATION' | 'LAB';
}

export function useServices(params: UseServicesParams = {}) {
  const { isActive, search, categoryType } = params;
  const [services, setServices] = useState<Service[]>([]);
  const { execute, isLoading, error } = useApiHandler();

  useEffect(() => {
    const fetchServices = async () => {
      await execute(
        async () => {
          const data = await servicesApi.getAll({ isActive, search, categoryType });
          setServices(data);
        },
        {
          errorFallbackMsg: 'genericErrorTitle',
        }
      );
    };

    const timer = setTimeout(() => {
      void fetchServices();
    }, 0);
    return () => clearTimeout(timer);
  }, [isActive, search, categoryType, execute]);

  return { services, isLoading, error };
}
