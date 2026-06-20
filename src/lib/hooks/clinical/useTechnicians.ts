import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/core/client';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export interface TechnicianSpecialization {
  id: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    code: string;
  };
}

export interface Technician {
  id: string;
  fullName: string;
  avatar?: string | null;
  phone?: string | null;
  technicianSpecializations: TechnicianSpecialization[];
}

export const techniciansApi = {
  /** Get all active technicians, optionally filtered by service category */
  getTechnicians: async (categoryId?: string): Promise<Technician[]> => {
    const params = categoryId ? { categoryId } : {};
    const response = await apiClient.get('/users/technicians', { params });
    return response.data.data;
  },

  /** Admin: add specialization to technician */
  addSpecialization: async (technicianId: string, categoryId: string): Promise<TechnicianSpecialization> => {
    const response = await apiClient.post(`/users/technicians/${technicianId}/specializations`, { categoryId });
    return response.data.data;
  },

  /** Admin: remove specialization from technician */
  removeSpecialization: async (technicianId: string, categoryId: string): Promise<void> => {
    await apiClient.delete(`/users/technicians/${technicianId}/specializations/${categoryId}`);
  },
};

/**
 * Hook to fetch technicians for doctor's lab order form.
 * Pass categoryId to get technicians with matching specialization.
 * Always includes all technicians (without categoryId filter) as fallback.
 */
export function useTechnicians(categoryId?: string) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const { execute, isLoading } = useApiHandler();

  const fetchTechnicians = useCallback(async () => {
    await execute(
      async () => {
        const data = await techniciansApi.getTechnicians(categoryId);
        setTechnicians(data);
      },
      { showErrorToast: false, onError: () => {} }
    );
  }, [categoryId, execute]);

  useEffect(() => {
    void fetchTechnicians();
  }, [fetchTechnicians]);

  return { technicians, isLoading, refetch: fetchTechnicians };
}
