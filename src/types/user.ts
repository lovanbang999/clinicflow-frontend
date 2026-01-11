export type UserRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UsersListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
