export type UserRole = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN' | 'TECHNICIAN';

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
  patientProfile?: {
    id: string;
    patientCode: string;
    isGuest: boolean;
    bloodType?: string;
    nationalId?: string;
    insuranceNumber?: string;
    insuranceProvider?: string;
    insuranceExpiry?: string;
    allergies?: string;
    chronicConditions?: string;
    familyHistory?: string;
    heightCm?: number;
    weightKg?: number;
  };
  doctorProfile?: {
    id: string;
    specialties?: string[];
    qualifications?: string[];
    bio?: string;
    yearsOfExperience?: number;
    rating?: number;
  };
}

export interface UpdateProfileDto {
  fullName?: string;
  email?: string;
  phone?: string;
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
