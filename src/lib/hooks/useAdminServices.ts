'use client';

import { useState, useCallback } from 'react';
import {
  adminServicesApi,
  type AdminService,
  type ServiceStats,
  type ServiceFiltersQuery,
  type AdminCreateServiceDto,
  type AdminUpdateServiceDto,
} from '@/lib/api/admin-services';
import { useApiHandler } from './useApiHandler';

export const useAdminServices = () => {
  // List
  const [services, setServices] = useState<AdminService[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  
  const { execute, isLoading: loadingList } = useApiHandler();
  
  // Stats (stat cards)
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const { execute: executeStats, isLoading: loadingStats } = useApiHandler();

  // Fetch all services
  const fetchServices = useCallback(async (filters?: ServiceFiltersQuery) => {
    const data = await execute(
      () => adminServicesApi.getServices(filters),
      { errorFallbackMsg: 'fetchServicesApiError' }
    );
    if (data) {
      setServices(data.services);
      setPagination(data.pagination);
    }
  }, [execute]);

  // Fetch stat cards
  const fetchStats = useCallback(async () => {
    const data = await executeStats(
      () => adminServicesApi.getStatistics(),
      { 
        showErrorToast: false, // Stats are non-critical — fail silently in UI
      }
    );
    if (data) {
      setStats(data);
    }
  }, [executeStats]);

  // Create
  const createService = async (
    dto: AdminCreateServiceDto,
  ): Promise<AdminService | undefined> => {
    return execute(
      () => adminServicesApi.createService(dto),
      {
        onSuccessMsg: 'createServiceApiSuccess',
        errorFallbackMsg: 'createServiceApiError'
      }
    );
  };

  // Update
  const updateService = async (
    id: string,
    dto: AdminUpdateServiceDto,
  ): Promise<AdminService | undefined> => {
    return execute(
      () => adminServicesApi.updateService(id, dto),
      {
        onSuccessMsg: 'updateServiceApiSuccess',
        errorFallbackMsg: 'updateServiceApiError'
      }
    );
  };

  // Delete
  const deleteService = async (id: string): Promise<void> => {
    await execute(
      () => adminServicesApi.deleteService(id),
      {
        onSuccessMsg: 'deleteServiceApiSuccess',
        errorFallbackMsg: 'deleteServiceApiError'
      }
    );
  };

  // Restore
  const restoreService = async (id: string): Promise<AdminService | undefined> => {
    return execute(
      () => adminServicesApi.restoreService(id),
      {
        onSuccessMsg: 'restoreServiceApiSuccess',
        errorFallbackMsg: 'restoreServiceApiError'
      }
    );
  };

  return {
    // State
    services,
    pagination,
    loadingList,
    stats,
    loadingStats,
    // Actions
    fetchServices,
    fetchStats,
    createService,
    updateService,
    deleteService,
    restoreService,
  };
};
