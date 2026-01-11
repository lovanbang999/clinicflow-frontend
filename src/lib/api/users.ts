import { AxiosError } from 'axios';
import { apiClient } from './client';
import { ApiResponse, User, UpdateProfileDto, ChangePasswordDto } from '@/types';
import { ApiError } from 'next/dist/server/api-utils';

export const usersApi = {
  // Get current user profile
  getMyProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get<ApiResponse<User>>('/users/me');

      if (!response.data.data) {
        throw new Error('Failed to fetch profile');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Update current user profile
  updateMyProfile: async (data: UpdateProfileDto): Promise<User> => {
    try {
      const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);

      if (!response.data.data) {
        throw new Error('Failed to update profile');
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Change password
  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    try {
      await apiClient.patch('/users/me/password', data);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ApiResponse<{ url: string }>>(
        '/upload/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (!response.data.data?.url) {
        throw new Error('Failed to upload avatar');
      }

      return response.data.data.url;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },
};
