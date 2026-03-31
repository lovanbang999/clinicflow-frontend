import apiClient from './client';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  VerifyEmailRequest
} from '@/types/auth';

export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    
    // Store tokens and user info
    if (response.data.success && typeof window !== 'undefined') {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return response.data;
  },

  // Register
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  // Verify email with OTP
  verifyEmail: async (data: VerifyEmailRequest): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/resend-otp', { email });
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      const refreshToken = typeof window !== 'undefined' 
        ? localStorage.getItem('refreshToken') 
        : null;
      
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
  },

  // Get current user
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('accessToken');
  },

  // Forgot Password — step 1: request OTP
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Forgot Password — step 2: verify OTP
  verifyResetOtp: async (
    email: string,
    code: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/verify-reset-otp', { email, code });
    return response.data;
  },

  // Forgot Password — step 3: set new password
  resetPassword: async (
    email: string,
    code: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/auth/reset-password', {
      email,
      code,
      newPassword,
    });
    return response.data;
  },
};

export default authApi;

