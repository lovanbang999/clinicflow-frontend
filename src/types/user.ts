// Base User type
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  role?: 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';
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
