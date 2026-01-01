'use client';

import { useState, useEffect } from 'react';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/types/service';
import { toast } from 'sonner';

interface UseServicesParams {
  isActive?: boolean;
  search?: string;
}

export function useServices(params?: UseServicesParams) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await servicesApi.getAll(params);
        setServices(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch services';
        setError(errorMessage);
        toast.error('Lỗi', {
          description: 'Không thể tải danh sách dịch vụ',
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchServices();
  }, [params]);

  return { services, isLoading, error };
}
