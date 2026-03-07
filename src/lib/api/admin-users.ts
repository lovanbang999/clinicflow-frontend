import { AxiosError } from 'axios';
import { apiClient } from './client';
import { ApiError } from 'next/dist/server/api-utils';
import {
  AdminUserStats,
  AdminCreateUserDto,
  AdminUpdateUserDto,
  AdminSuspendUserDto,
  UserFilters,
  UsersListResponse,
  User,
  ApiResponse,
} from '@/types';

export const adminUsersApi = {
  // Get users list (paginated, filtered)
  getUsers: async (filters: UserFilters): Promise<UsersListResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<UsersListResponse>>('/admin/users', {
        params: filters,
      });

      if (!response.data.data) {
        throw new Error('Failed to fetch users');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Get user statistics
  getStatistics: async (): Promise<AdminUserStats> => {
    try {
      const response = await apiClient.get<ApiResponse<AdminUserStats>>('/admin/users/statistics');

      if (!response.data.data) {
        throw new Error('Failed to fetch user statistics');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${id}`);

      if (!response.data.data) {
        throw new Error('Failed to fetch user');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Create a new user (Admin)
  createUser: async (data: AdminCreateUserDto): Promise<User> => {
    try {
      const response = await apiClient.post<ApiResponse<User>>('/admin/users', data);

      if (!response.data.data) {
        throw new Error('Failed to create user');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Update user (Admin)
  updateUser: async (id: string, data: AdminUpdateUserDto): Promise<User> => {
    try {
      const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}`, data);

      if (!response.data.data) {
        throw new Error('Failed to update user');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Suspend/Reinstate user
  suspendUser: async (id: string, data: AdminSuspendUserDto): Promise<User> => {
    try {
      const response = await apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/suspend`, data);

      if (!response.data.data) {
        throw new Error('Failed to suspend/reinstate user');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Soft delete user
  deleteUser: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};
