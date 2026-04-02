import { apiClient } from './client';
import { Category, CreateCategoryDto, UpdateCategoryDto, ApiResponse, PaginatedResult } from '@/types';

export const categoriesApi = {
  // Get all categories
  getAll: async (params?: { isActive?: boolean; page?: number; limit?: number }): Promise<PaginatedResult<Category>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResult<Category>>>('/categories', {
      params,
    });
    return response.data.data!;
  },

  // Get category by ID
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    if (!response.data.data) {
      throw new Error('fetchDetailError');
    }
    return response.data.data;
  },

  // Create category (admin)
  create: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data);
    if (!response.data.data) {
      throw new Error('createCategoryError');
    }
    return response.data.data;
  },

  // Update category (admin)
  update: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    if (!response.data.data) {
      throw new Error('updateCategoryError');
    }
    return response.data.data;
  },

  // Delete category (admin)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
