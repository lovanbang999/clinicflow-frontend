'use client';

import { useState, useEffect } from 'react';
import { servicesApi } from '@/lib/api/services';
import { Service } from '@/types/service';
import { toast } from 'sonner';

export function useService(id: string) {
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchService = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await servicesApi.getById(id);
        setService(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service details';
        setError(errorMessage);
        toast.error('Lỗi', {
          description: 'Không thể tải chi tiết dịch vụ',
        });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchService();
  }, [id]);

  return { service, isLoading, error };
}
