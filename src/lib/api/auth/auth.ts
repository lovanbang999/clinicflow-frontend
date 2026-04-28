import apiClient from '@/lib/api/core/client';
import { useAuthStore } from '@/lib/store/authStore';
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
    
    // Update Zustand store
    if (response.data.success) {
      const { accessToken, refreshToken, user } = response.data.data;
      useAuthStore.getState().login(user, accessToken, refreshToken);
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
      const { refreshToken, clearAuth } = useAuthStore.getState();
      
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
      
      // Clear Zustand store
      clearAuth();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear auth on failure
      useAuthStore.getState().clearAuth();
    }
  },

  // Get current user
  getCurrentUser: () => {
    return useAuthStore.getState().user;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return useAuthStore.getState().isAuthenticated;
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


