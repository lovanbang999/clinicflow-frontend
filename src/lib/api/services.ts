import { apiClient } from './client';
import { Service, CreateServiceDto, UpdateServiceDto } from '@/types';

export const servicesApi = {
  // Get all services
  getAll: async (includeInactive = false): Promise<Service[]> => {
    const response = await apiClient.get<Service[]>('/services', {
      params: { includeInactive },
    });
    return response.data;
  },

  // Get service by ID
  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<Service>(`/services/${id}`);
    return response.data;
  },

  // Create service (admin)
  create: async (data: CreateServiceDto): Promise<Service> => {
    const response = await apiClient.post<Service>('/services', data);
    return response.data;
  },

  // Update service (admin)
  update: async (id: string, data: UpdateServiceDto): Promise<Service> => {
    const response = await apiClient.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  // Delete service - soft delete (admin)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },
};
