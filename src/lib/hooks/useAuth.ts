import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { toast } from 'sonner';
import { ApiError } from '@/types';

export const useAuth = () => {
  const router = useRouter();
  const t = useTranslations('auth');
  
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
        toast.success(t('login.success'), {
          description: t('login.successDescription', { name: user.fullName }),
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
      const errorMessage = error.error?.message || error.message || t('login.failed');

      // Show error toast
      toast.error(t('login.failed'), {
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
        toast.success(t('register.success'), {
          description: t('register.successDescription'),
        });

        return response;
      }

      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.error?.message || error.message || t('register.failed');

      // Show error toast
      toast.error(t('register.failed'), {
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

      toast.success(t('logout.success'), {
        description: t('logout.successDescription'),
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

      toast.success(t('verify.success'), {
        description: t('verify.successDescription'),
      });

      return response;
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.error?.message || error.message || t('verify.failed');

      toast.error(t('verify.failed'), {
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

      toast.success(t('verify.resendSuccess'), {
        description: t('verify.resendSuccessDescription'),
      });

      return response;
    } catch (err) {
      const error = err as ApiError;
      const errorMessage = error.error?.message || error.message || t('verify.resendFailed');

      toast.error(t('verify.resendFailed'), {
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
