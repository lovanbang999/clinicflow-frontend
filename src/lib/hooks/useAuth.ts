import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { toast } from 'sonner';
import { ApiError } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const { 
    user, 
    isAuthenticated, 
    isLoading,
    login: setLogin, 
    logout: clearAuth,
    setLoading,
  } = useAuthStore();

  const [localLoading, setLocalLoading] = useState(false);

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true);
      setLocalLoading(true);

      const response = await authApi.login(credentials);

      if (response.success) {
        const { user, accessToken, refreshToken } = response.data;
        setLogin(user, accessToken, refreshToken);
        
        // Show success toast
        toast.success('Đăng nhập thành công!', {
          description: `Chào mừng ${user.fullName}`,
        });
        
        // Redirect based on role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin/users');
            break;
          case 'DOCTOR':
            router.push('/doctor/schedule');
            break;
          case 'RECEPTIONIST':
            router.push('/receptionist/dashboard');
            break;
          case 'PATIENT':
            router.push('/patient/book');
            break;
          default:
            router.push('/');
        }

        return response;
      }

      throw new Error(response.message || 'Login failed');
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.error?.message || error.message || 'Đăng nhập thất bại';
      
      // Show error toast
      toast.error('Đăng nhập thất bại!', {
        description: errorMessage,
      });
      
      throw err;
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setLocalLoading(true);

      const response = await authApi.register(data);

      if (response.success) {
        // Show success toast
        toast.success('Đăng ký thành công!', {
          description: 'Vui lòng kiểm tra email để xác thực tài khoản.',
        });
        
        return response;
      }

      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.error?.message || error.message || 'Đăng ký thất bại';
      
      // Show error toast
      toast.error('Đăng ký thất bại', {
        description: errorMessage,
      });
      
      throw err;
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authApi.logout();
      clearAuth();
      
      toast.success('Đăng xuất thành công', {
        description: 'Hẹn gặp lại bạn!',
      });
      
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      clearAuth();
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, otp: string) => {
    try {
      setLoading(true);
      setLocalLoading(true);

      const response = await authApi.verifyEmail({ email, otp });
      
      toast.success('Xác thực thành công!', {
        description: 'Tài khoản của bạn đã được kích hoạt.',
      });
      
      return response;
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.error?.message || error.message || 'Xác thực thất bại';
      
      toast.error('Xác thực thất bại', {
        description: errorMessage,
      });
      
      throw err;
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      setLoading(true);
      setLocalLoading(true);

      const response = await authApi.resendVerification(email);
      
      toast.success('Gửi lại mã thành công!', {
        description: 'Vui lòng kiểm tra email của bạn.',
      });
      
      return response;
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.error?.message || error.message || 'Gửi lại mã thất bại';
      
      toast.error('Gửi lại mã thất bại', {
        description: errorMessage,
      });
      
      throw err;
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || localLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
  };
};
