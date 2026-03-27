'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  adminServicesApi,
  type AdminService,
  type ServiceStats,
  type ServiceFiltersQuery,
  type AdminCreateServiceDto,
  type AdminUpdateServiceDto,
} from '@/lib/api/admin-services';

export const useAdminServices = () => {
  // List
  const [services, setServices] = useState<AdminService[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loadingList, setLoadingList] = useState(false);

  // Stats (stat cards)
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch all services
  const fetchServices = useCallback(async (filters?: ServiceFiltersQuery) => {
    setLoadingList(true);
    try {
      const data = await adminServicesApi.getServices(filters);
      setServices(data.services);
      setPagination(data.pagination);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminServices.fetchServices]', error);
      toast.error(error.message || 'Failed to fetch services');
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Fetch stat cards
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await adminServicesApi.getStatistics();
      setStats(data);
    } catch (err) {
      const error = err as Error;
      console.error('[useAdminServices.fetchStats]', error);
      // Stats are non-critical — fail silently in UI
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Create
  const createService = async (
    dto: AdminCreateServiceDto,
  ): Promise<AdminService> => {
    try {
      const created = await adminServicesApi.createService(dto);
      toast.success('Service created successfully');
      return created;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to create service');
      throw error;
    }
  };

  // Update
  const updateService = async (
    id: string,
    dto: AdminUpdateServiceDto,
  ): Promise<AdminService> => {
    try {
      const updated = await adminServicesApi.updateService(id, dto);
      toast.success('Service updated successfully');
      return updated;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to update service');
      throw error;
    }
  };

  // Delete
  const deleteService = async (id: string): Promise<void> => {
    try {
      await adminServicesApi.deleteService(id);
      toast.success('Service deleted successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete service');
      throw error;
    }
  };

  // Restore
  const restoreService = async (id: string): Promise<AdminService> => {
    try {
      const restored = await adminServicesApi.restoreService(id);
      toast.success('Service restored successfully');
      return restored;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to restore service');
      throw error;
    }
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
