import { apiClient } from './client';
import { Service, CreateServiceDto, UpdateServiceDto, ApiResponse } from '@/types';

export const servicesApi = {
  // Get all services
  getAll: async (params?: { isActive?: boolean; search?: string }): Promise<Service[]> => {
    const response = await apiClient.get<ApiResponse<Service[]>>('/services', {
      params,
    });
    return response.data.data || [];
  },

  // Get service by ID
  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<ApiResponse<Service>>(`/services/${id}`);
    if (!response.data.data) {
      throw new Error('Service not found');
    }
    return response.data.data;
  },

  // Create service (admin)
  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await apiClient.post<ApiResponse<Service>>('/services', data);
    if (!response.data.data) {
      throw new Error('Failed to create service');
    }
    return response.data.data;
  },

  // Update service (admin)
  update: async (id: string, data: UpdateServiceDto): Promise<Service> => {
    const response = await apiClient.patch<ApiResponse<Service>>(`/services/${id}`, data);
    if (!response.data.data) {
      throw new Error('Failed to update service');
    }
    return response.data.data;
  },

  // Delete service - soft delete (admin)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },
};
