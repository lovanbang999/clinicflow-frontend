import { apiClient } from '@/lib/api/core/client';
import {
  Doctor,
  ApiResponse,
  DoctorsListResponse,
  BackendUser,
} from '@/types';

export const doctorsApi = {
  // Get all doctors (Public - No auth required)
  // Backend only supports: serviceId, page, limit
  // specialty and isActive filtering is done client-side
  getAll: async (params?: { serviceId?: string; page?: number; limit?: number }): Promise<Doctor[]> => {
    const response = await apiClient.get<ApiResponse<DoctorsListResponse>>(
      '/users/public/doctors',
      {
        params: {
          ...(params?.serviceId ? { serviceId: params.serviceId } : {}),
          page: params?.page ?? 1,
          limit: params?.limit ?? 100,
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
      gender: user.gender,
      specialties: user.doctorProfile?.specialties || ['Nội tổng quát'],
      qualifications: user.doctorProfile?.qualifications || ['Bác sĩ'],
      yearsOfExperience: user.doctorProfile?.yearsOfExperience || 0,
      bio: user.doctorProfile?.bio,
      consultationFee: (user.doctorProfile as { consultationFee?: number | null } | undefined)?.consultationFee ?? null,
      rating: Number(user.doctorProfile?.rating || 0),
      reviewCount: user.doctorProfile?.reviewCount || 0,
      services: user.doctorProfile?.services?.map(
        (ds: { service: { id: string; name: string; category: string | null } }) => ds.service
      ) || [],
      isActive: user.isActive,
      workingHours: user.workingHours,
      offDays: user.offDays,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  },

  // Get doctor by ID (Public - No auth required)
  getById: async (id: string): Promise<Doctor> => {
    const response = await apiClient.get<ApiResponse<BackendUser>>(`/users/public/doctors/${id}`);

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
      gender: user.gender,
      specialties: user.doctorProfile?.specialties || ['Nội tổng quát'],
      qualifications: user.doctorProfile?.qualifications || ['Bác sĩ'],
      yearsOfExperience: user.doctorProfile?.yearsOfExperience || 0,
      bio: user.doctorProfile?.bio,
      consultationFee: (user.doctorProfile as { consultationFee?: number | null } | undefined)?.consultationFee ?? null,
      rating: Number(user.doctorProfile?.rating || 0),
      reviewCount: user.doctorProfile?.reviewCount || 0,
      services: user.doctorProfile?.services?.map(
        (ds: { service: { id: string; name: string; category: string | null } }) => ds.service
      ) || [],
      isActive: user.isActive,
      workingHours: user.workingHours,
      offDays: user.offDays,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

  },
};
