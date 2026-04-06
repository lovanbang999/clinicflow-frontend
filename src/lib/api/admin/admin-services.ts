import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types';
import type { AxiosError } from 'axios';

// Types
export interface AdminService {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  durationMinutes: number;
  price: number;
  maxSlotsPerHour: number;
  categoryId?: string | null;
  category?: {
    id: string;
    code: string;
    name: string;
  } | null;
  preparationNotes?: string | null;
  tags: string[];
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
  category?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedServices {
  services: AdminService[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminCreateServiceDto {
  name: string;
  description?: string;
  iconUrl?: string;
  price: number;
  durationMinutes: number;
  maxSlotsPerHour: number;
  categoryId?: string;
  preparationNotes?: string;
  tags?: string[];
  isActive?: boolean;
}

export type AdminUpdateServiceDto = Partial<AdminCreateServiceDto>;

// Error handler
const handleError = (error: unknown): never => {
  const axiosErr = error as AxiosError;
  if (axiosErr?.response?.data) {
    throw axiosErr.response.data;
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
  getServices: async (
    filters?: ServiceFiltersQuery,
  ): Promise<PaginatedServices> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedServices>>(
        '/admin/services',
        { params: filters },
      );
      if (!res.data.data) {
        return {
          services: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
      }
      return res.data.data;
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
