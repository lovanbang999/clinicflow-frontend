import { apiClient } from '@/lib/api/core/client';
import { ApiResponse, User, UpdateProfileDto, ChangePasswordDto, UsersListResponse } from '@/types';

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

export interface ReceptionistPatientStats {
  totalPatients: number;
  newToday: number;
  activeAppointments: number;
}

export interface PatientFilters {
  search?: string;
  isGuest?: boolean;
  gender?: string;
  status?: string;
  bloodType?: string;
  page?: number;
  limit?: number;
}

export const usersApi = {
  // Get current user profile
  getMyProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');

      if (!response.data.data) {
        throw new Error('Failed to fetch profile');
      }

      return response.data.data;
},

  // Update current user profile
  updateMyProfile: async (data: UpdateProfileDto): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>('/users/me', data);

      if (!response.data.data) {
        throw new Error('Failed to update profile');
      }

      return response.data.data;
},

  // Change password
  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await apiClient.patch('/users/me/password', data);
},

  // Upload avatar
  uploadAvatar: async (file: File): Promise<string> => {
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
},

  // List patients with filters (RECEPTIONIST/ADMIN)
  getReceptionistPatients: async (filters: PatientFilters): Promise<UsersListResponse> => {
    const response = await apiClient.get<ApiResponse<{ items?: User[]; users?: User[]; pagination?: { total: number; page: number; limit: number; totalPages: number }; total?: number; page?: number; limit?: number }>>('/users/receptionist/patients', {
        params: filters,
      });
      const data = response.data.data;
      if (!data) return { users: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      
      return {
        users: data.items || data.users || [],
        pagination: data.pagination || {
          total: data.total || 0,
          page: data.page || 1,
          limit: data.limit || 10,
          totalPages: Math.ceil((data.total || 0) / (data.limit || 10)) || 0
        }
      };
},

  // Get patient statistics (RECEPTIONIST/ADMIN)
  getReceptionistPatientsStats: async (): Promise<ReceptionistPatientStats> => {
    const response = await apiClient.get<ApiResponse<ReceptionistPatientStats>>('/users/receptionist/patients/stats');
      if (!response.data.data) {
        throw new Error('Failed to fetch statistics');
      }
      return response.data.data;
},

  // Update patient profile (RECEPTIONIST/ADMIN)
  updatePatientProfile: async (id: string, data: Partial<RegisterPatientDto & { 
    bloodType?: string; 
    nationalId?: string; 
    insuranceNumber?: string;
    insuranceProvider?: string;
    insuranceExpiry?: string;
    allergies?: string;
    chronicConditions?: string;
    familyHistory?: string;
  }>): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/receptionist/patients/${id}`, data);
      if (!response.data.data) {
        throw new Error('Failed to update patient profile');
      }
      return response.data.data;
},

  // Search patients (Legacy wrapper)
  searchPatients: async (search: string, page: number = 1, limit: number = 5): Promise<UsersListResponse> => {
    return usersApi.getReceptionistPatients({ search, page, limit });
  },

  // Create patient with system account
  registerPatient: async (data: RegisterPatientDto): Promise<User & { tempPassword?: string }> => {
    const { isGuest, ...payload } = data as RegisterPatientDto & { isGuest?: boolean };
      void isGuest; // Silence unused warning
      const response = await apiClient.post<ApiResponse<User & { tempPassword?: string }>>('/users/receptionist/patients/account', payload);
      if (!response.data.data) {
        throw new Error('Failed to register patient');
      }
      return response.data.data;
},

  // Create guest patient profile
  createGuestPatient: async (data: CreateGuestPatientDto): Promise<User> => {
    const { isGuest, email, ...payload } = data as CreateGuestPatientDto & { isGuest?: boolean; email?: string };
      void isGuest; // Silence unused warning
      void email;   // Silence unused warning
      const response = await apiClient.post<ApiResponse<User>>('/users/receptionist/patients/guest', payload);
      if (!response.data.data) {
        throw new Error('Failed to create guest patient');
      }
      return response.data.data;
},
};
