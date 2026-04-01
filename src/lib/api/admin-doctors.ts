import { apiClient } from './client';
import { ApiResponse, BackendUser } from '@/types';
import type { AxiosError } from 'axios';

// Backend returns `doctors` key (not `users`) for the list endpoint
interface AdminDoctorsListRaw {
  doctors: BackendUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Normalised shape consumed by the hook
export interface AdminDoctorsListResponse {
  users: BackendUser[];
  pagination: AdminDoctorsListRaw['pagination'];
}

// Payload types
export interface AdminCreateDoctorDto {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  isActive?: boolean;
}

export interface AdminUpdateDoctorProfileDto {
  specialties?: string[];
  qualifications?: string[];
  yearsOfExperience?: number;
  bio?: string;
  rating?: number;
}

export interface AdminToggleDoctorStatusDto {
  isActive: boolean;
}

export interface DoctorFiltersQuery {
  specialty?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface DoctorStatsResponse {
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  newThisMonth: number;
  bySpecialty: Record<string, number>;
}

// API
const handleError = (error: unknown): never => {
  const axiosErr = error as AxiosError;
  if (axiosErr?.response?.data) {
    throw axiosErr.response.data;
  }
  throw error;
};

export const adminDoctorsApi = {
  // GET /admin/doctors
  getDoctors: async (filters: DoctorFiltersQuery): Promise<AdminDoctorsListResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<AdminDoctorsListRaw>>('/admin/doctors', {
        params: filters,
      });
      const raw = response.data.data;
      if (!raw) throw new Error('Failed to fetch doctors');
      // Normalise: backend returns `doctors` key, hook expects `users`
      return { users: raw.doctors ?? [], pagination: raw.pagination };
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/doctors/statistics
  getStatistics: async (): Promise<DoctorStatsResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<DoctorStatsResponse>>('/admin/doctors/statistics');
      if (!response.data.data) throw new Error('Failed to fetch doctor statistics');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // GET /admin/doctors/:id
  getDoctorById: async (id: string): Promise<BackendUser> => {
    try {
      const response = await apiClient.get<ApiResponse<BackendUser>>(`/admin/doctors/${id}`);
      if (!response.data.data) throw new Error('Failed to fetch doctor');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // POST /admin/doctors
  createDoctor: async (data: AdminCreateDoctorDto): Promise<BackendUser> => {
    try {
      const response = await apiClient.post<ApiResponse<BackendUser>>('/admin/doctors', data);
      if (!response.data.data) throw new Error('Failed to create doctor');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH /admin/doctors/:id/profile
  updateDoctorProfile: async (id: string, data: AdminUpdateDoctorProfileDto): Promise<BackendUser> => {
    try {
      const response = await apiClient.patch<ApiResponse<BackendUser>>(`/admin/doctors/${id}/profile`, data);
      if (!response.data.data) throw new Error('Failed to update doctor profile');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH /admin/users/:id (for name, email, phone)
  updateDoctorUser: async (id: string, data: { fullName?: string; email?: string; phone?: string; isActive?: boolean }): Promise<BackendUser> => {
    try {
      const response = await apiClient.patch<ApiResponse<BackendUser>>(`/admin/users/${id}`, data);
      if (!response.data.data) throw new Error('Failed to update doctor user');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // PATCH /admin/doctors/:id/status
  toggleStatus: async (id: string, data: AdminToggleDoctorStatusDto): Promise<BackendUser> => {
    try {
      const response = await apiClient.patch<ApiResponse<BackendUser>>(`/admin/doctors/${id}/status`, data);
      if (!response.data.data) throw new Error('Failed to update doctor status');
      return response.data.data;
    } catch (error) {
      return handleError(error);
    }
  },

  // DELETE /admin/users/:id (soft delete)
  deleteDoctor: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },
};
