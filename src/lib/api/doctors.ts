import { apiClient } from './client';
import {
  Doctor,
  ApiResponse,
  DoctorsListResponse,
  BackendUser,
} from '@/types';

export const doctorsApi = {
  // Get all doctors (Public - No auth required)
  getAll: async (params?: { specialty?: string; isActive?: boolean }): Promise<Doctor[]> => {
    const response = await apiClient.get<ApiResponse<DoctorsListResponse>>(
      '/users/public/doctors',
      {
        params: {
          specialty: params?.specialty,
          page: 1,
          limit: 100,
        },
      },
    );

    const users = response.data.data?.users || [];

    // Transform backend data to frontend Doctor type
    return users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      specialties: user.doctorProfile?.specialties || ['Nội tổng quát'],
      qualifications: user.doctorProfile?.qualifications || ['Bác sĩ'],
      yearsOfExperience: user.doctorProfile?.yearsOfExperience || 0,
      bio: user.doctorProfile?.bio,
      rating: user.doctorProfile?.rating || 0,
      reviewCount: user.doctorProfile?.reviewCount || 0,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  },

  // Get doctor by ID (could also be public)
  getById: async (id: string): Promise<Doctor> => {
    const response = await apiClient.get<ApiResponse<BackendUser>>(`/users/${id}`);

    if (!response.data.data) {
      throw new Error('Doctor not found');
    }

    const user = response.data.data;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      specialties: user.doctorProfile?.specialties || ['Nội tổng quát'],
      qualifications: user.doctorProfile?.qualifications || ['Bác sĩ'],
      yearsOfExperience: user.doctorProfile?.yearsOfExperience || 0,
      bio: user.doctorProfile?.bio,
      rating: user.doctorProfile?.rating || 0,
      reviewCount: user.doctorProfile?.reviewCount || 0,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
