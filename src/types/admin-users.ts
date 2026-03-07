import { UserRole } from './user';

export interface AdminUserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<string, number>;
  doctorProfileCount: number;
}

export interface AdminCreateUserDto {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive?: boolean;
}

export interface AdminUpdateUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface AdminSuspendUserDto {
  isActive: boolean;
}
