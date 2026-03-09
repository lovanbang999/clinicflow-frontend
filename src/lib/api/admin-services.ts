import { AxiosError } from 'axios';
import { apiClient } from './client';
import { ApiResponse } from '@/types';

// Types
export interface AdminService {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  durationMinutes: number;
  price: number;
  maxSlotsPerHour: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  newThisMonth: number;
  mostBooked: { id: string; name: string; bookingCount: number } | null;
}

export interface ServiceFiltersQuery {
  isActive?: boolean;
  search?: string;
}

export interface AdminCreateServiceDto {
  name: string;
  description?: string;
  iconUrl?: string;
  price: number;
  durationMinutes: number;
  maxSlotsPerHour: number;
  isActive?: boolean;
}

export type AdminUpdateServiceDto = Partial<AdminCreateServiceDto>;

// Error handler
const handleError = (error: unknown): never => {
  if (error instanceof AxiosError && error.response?.data) {
    throw error.response.data;
  }
  throw error;
};

// API object
export const adminServicesApi = {
  // GET /admin/services/statistics
  getStatistics: async (): Promise<ServiceStats> => {
    try {
      const res = await apiClient.get<ApiResponse<ServiceStats>>(
        '/admin/services/statistics',
      );
      if (!res.data.data) throw new Error('Failed to fetch service statistics');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/services
  getServices: async (filters?: ServiceFiltersQuery): Promise<AdminService[]> => {
    try {
      const res = await apiClient.get<ApiResponse<AdminService[]>>(
        '/admin/services',
        { params: filters },
      );
      const raw = res.data;
      // Backend wraps in { success, data, ... }
      const list = Array.isArray(raw.data) ? raw.data : [];
      return list;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/services/:id
  getServiceById: async (id: string): Promise<AdminService> => {
    try {
      const res = await apiClient.get<ApiResponse<AdminService>>(
        `/admin/services/${id}`,
      );
      if (!res.data.data) throw new Error('Service not found');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /admin/services
  createService: async (data: AdminCreateServiceDto): Promise<AdminService> => {
    try {
      const res = await apiClient.post<ApiResponse<AdminService>>(
        '/admin/services',
        data,
      );
      if (!res.data.data) throw new Error('Failed to create service');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH /admin/services/:id
  updateService: async (
    id: string,
    data: AdminUpdateServiceDto,
  ): Promise<AdminService> => {
    try {
      const res = await apiClient.patch<ApiResponse<AdminService>>(
        `/admin/services/${id}`,
        data,
      );
      if (!res.data.data) throw new Error('Failed to update service');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /admin/services/:id
  deleteService: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/services/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH /admin/services/:id/restore
  restoreService: async (id: string): Promise<AdminService> => {
    try {
      const res = await apiClient.patch<ApiResponse<AdminService>>(
        `/admin/services/${id}/restore`,
      );
      if (!res.data.data) throw new Error('Failed to restore service');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
