'use client';

import { useState, useCallback } from 'react';
import {
  adminMedicinesApi,
  type AdminMedicine,
  type MedicineStats,
  type MedicineFiltersQuery,
  type AdminCreateMedicineDto,
  type AdminUpdateMedicineDto,
} from '@/lib/api/admin/admin-medicines';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export const useAdminMedicines = () => {
  // List
  const [medicines, setMedicines] = useState<AdminMedicine[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const { execute, isLoading: loadingList } = useApiHandler();

  // Stats (stat cards)
  const [stats, setStats] = useState<MedicineStats | null>(null);
  const { execute: executeStats, isLoading: loadingStats } = useApiHandler();

  // Fetch all medicines
  const fetchMedicines = useCallback(
    async (filters?: MedicineFiltersQuery) => {
      const data = await execute(
        () => adminMedicinesApi.getMedicines(filters),
        { errorFallbackMsg: 'fetchMedicinesApiError' },
      );
      if (data) {
        setMedicines(data.medicines);
        setPagination(data.pagination);
      }
    },
    [execute],
  );

  // Fetch stat cards
  const fetchStats = useCallback(async () => {
    const data = await executeStats(() => adminMedicinesApi.getStatistics(), {
      showErrorToast: false, // Stats are non-critical — fail silently in UI
    });
    if (data) {
      setStats(data);
    }
  }, [executeStats]);

  // Create
  const createMedicine = async (
    dto: AdminCreateMedicineDto,
  ): Promise<AdminMedicine | undefined> => {
    return execute(() => adminMedicinesApi.createMedicine(dto), {
      onSuccessMsg: 'createMedicineApiSuccess',
      errorFallbackMsg: 'createMedicineApiError',
    });
  };

  // Update
  const updateMedicine = async (
    id: string,
    dto: AdminUpdateMedicineDto,
  ): Promise<AdminMedicine | undefined> => {
    return execute(() => adminMedicinesApi.updateMedicine(id, dto), {
      onSuccessMsg: 'updateMedicineApiSuccess',
      errorFallbackMsg: 'updateMedicineApiError',
    });
  };

  // Delete
  const deleteMedicine = async (id: string): Promise<void> => {
    await execute(() => adminMedicinesApi.deleteMedicine(id), {
      onSuccessMsg: 'deleteMedicineApiSuccess',
      errorFallbackMsg: 'deleteMedicineApiError',
    });
  };

  // Restore
  const restoreMedicine = async (
    id: string,
  ): Promise<AdminMedicine | undefined> => {
    return execute(() => adminMedicinesApi.restoreMedicine(id), {
      onSuccessMsg: 'restoreMedicineApiSuccess',
      errorFallbackMsg: 'restoreMedicineApiError',
    });
  };

  return {
    // State
    medicines,
    pagination,
    loadingList,
    stats,
    loadingStats,
    // Actions
    fetchMedicines,
    fetchStats,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    restoreMedicine,
  };
};
