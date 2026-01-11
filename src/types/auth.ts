// Import User from user types
import type { User, UserRole } from './user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message: string;
  messageCode: string;
  timestamp: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: UserRole;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    userId: string;
    email: string;
  };
  message: string;
  messageCode: string;
  timestamp: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface AuthError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  messageCode: string;
  timestamp: string;
}
