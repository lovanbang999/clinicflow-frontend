import { AxiosError } from 'axios';
import { apiClient } from './client';
import { ApiResponse, User, UpdateProfileDto, ChangePasswordDto, UsersListResponse } from '@/types';
import { ApiError } from 'next/dist/server/api-utils';

export interface RegisterPatientDto {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  nationalId?: string;
  bloodType?: string;
}

export interface CreateGuestPatientDto {
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  nationalId?: string;
  bloodType?: string;
}

export type QuickCreatePatientDto = RegisterPatientDto | CreateGuestPatientDto;

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

  // Search patients (includes both accounts and guests for RECEPTIONIST/ADMIN)
  searchPatients: async (search: string, page: number = 1, limit: number = 5): Promise<UsersListResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<UsersListResponse>>('/users/receptionist/patients', {
        params: { search, page, limit },
      });
      return response.data.data || { users: [], pagination: { total: 0, page: 1, limit: 5, totalPages: 0 } };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Create patient with system account
  registerPatient: async (data: RegisterPatientDto): Promise<User> => {
    try {
      const { isGuest, ...payload } = data as RegisterPatientDto & { isGuest?: boolean };
      void isGuest; // Silence unused warning
      const response = await apiClient.post<ApiResponse<User>>('/users/receptionist/patients/account', payload);
      if (!response.data.data) {
        throw new Error('Failed to register patient');
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },

  // Create guest patient profile
  createGuestPatient: async (data: CreateGuestPatientDto): Promise<User> => {
    try {
      const { isGuest, email, ...payload } = data as CreateGuestPatientDto & { isGuest?: boolean; email?: string };
      void isGuest; // Silence unused warning
      void email;   // Silence unused warning
      const response = await apiClient.post<ApiResponse<User>>('/users/receptionist/patients/guest', payload);
      if (!response.data.data) {
        throw new Error('Failed to create guest patient');
      }
      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw error;
    }
  },
};
