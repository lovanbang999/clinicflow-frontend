import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types';
import type { AxiosError } from 'axios';

// Types
export interface AdminMedicine {
  id: string;
  code: string;
  genericName: string;
  brandName?: string | null;
  concentration?: string | null;
  dosageForm?: string | null;
  defaultUnit: string;
  defaultPrice: number;
  isActive: boolean;
  stockQuantity: number;
  notes?: string | null;
  registrationNumber?: string | null;
  ingredients?: string | null;
  sideEffects?: string | null;
  warnings?: string | null;
  manufacturerBrand?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  usage?: string | null;
  uses?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicineStats {
  totalMedicines: number;
  activeMedicines: number;
  inactiveMedicines: number;
  outOfStockMedicines: number;
}

export interface MedicineFiltersQuery {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMedicines {
  medicines: AdminMedicine[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdminCreateMedicineDto {
  code: string;
  genericName: string;
  brandName?: string;
  concentration?: string;
  dosageForm?: string;
  defaultUnit?: string;
  defaultPrice: number;
  isActive?: boolean;
  stockQuantity: number;
  notes?: string;
  registrationNumber?: string;
  ingredients?: string;
  sideEffects?: string;
  warnings?: string;
  manufacturerBrand?: string;
  country?: string;
  imageUrl?: string;
  usage?: string;
  uses?: string;
}

export type AdminUpdateMedicineDto = Partial<AdminCreateMedicineDto>;

// Error handler
const handleError = (error: unknown): never => {
  const axiosErr = error as AxiosError;
  if (axiosErr?.response?.data) {
    throw axiosErr.response.data;
  }
  throw error;
};

// API object
export const adminMedicinesApi = {
  // GET /admin/medicines/statistics
  getStatistics: async (): Promise<MedicineStats> => {
    try {
      const res = await apiClient.get<ApiResponse<MedicineStats>>(
        '/admin/medicines/statistics',
      );
      if (!res.data.data) throw new Error('Failed to fetch medicine statistics');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/medicines
  getMedicines: async (
    filters?: MedicineFiltersQuery,
  ): Promise<PaginatedMedicines> => {
    try {
      const res = await apiClient.get<ApiResponse<PaginatedMedicines>>(
        '/admin/medicines',
        { params: filters },
      );
      if (!res.data.data) {
        return {
          medicines: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        };
      }
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/medicines/:id
  getMedicineById: async (id: string): Promise<AdminMedicine> => {
    try {
      const res = await apiClient.get<ApiResponse<AdminMedicine>>(
        `/admin/medicines/${id}`,
      );
      if (!res.data.data) throw new Error('Medicine not found');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /admin/medicines
  createMedicine: async (data: AdminCreateMedicineDto): Promise<AdminMedicine> => {
    try {
      const res = await apiClient.post<ApiResponse<AdminMedicine>>(
        '/admin/medicines',
        data,
      );
      if (!res.data.data) throw new Error('Failed to create medicine');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH /admin/medicines/:id
  updateMedicine: async (
    id: string,
    data: AdminUpdateMedicineDto,
  ): Promise<AdminMedicine> => {
    try {
      const res = await apiClient.patch<ApiResponse<AdminMedicine>>(
        `/admin/medicines/${id}`,
        data,
      );
      if (!res.data.data) throw new Error('Failed to update medicine');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /admin/medicines/:id
  deleteMedicine: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/medicines/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH /admin/medicines/:id/restore
  restoreMedicine: async (id: string): Promise<AdminMedicine> => {
    try {
      const res = await apiClient.patch<ApiResponse<AdminMedicine>>(
        `/admin/medicines/${id}/restore`,
      );
      if (!res.data.data) throw new Error('Failed to restore medicine');
      return res.data.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
