import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { authApi } from '@/lib/api/auth';
import type { LoginRequest, RegisterRequest } from '@/types/auth';
import { toast } from 'sonner';
import { useApiHandler } from './useApiHandler';

export const useAuth = () => {
  const router = useRouter();
  const t = useTranslations('auth');
  
  const {
    user,
    isAuthenticated,
    isLoading: storeLoading,
    login: setLogin,
    logout: clearAuth,
    setLoading,
  } = useAuthStore();

  const { execute, isLoading: actionLoading } = useApiHandler();

  const login = async (credentials: LoginRequest) => {
    return execute(
      async () => {
        setLoading(true);
        const response = await authApi.login(credentials);
        if (!response.success) throw new Error(response.message || 'Login failed');
        
        const { user: authedUser, accessToken, refreshToken } = response.data;
        setLogin(authedUser, accessToken, refreshToken);
        
        // Show success toast manually because dynamic description is used
        toast.success(t('login.success'), {
          description: t('login.successDescription', { name: authedUser.fullName }),
        });

        switch (authedUser.role) {
          case 'ADMIN': router.push('/admin'); break;
          case 'DOCTOR': router.push('/doctor'); break;
          case 'RECEPTIONIST': router.push('/receptionist'); break;
          case 'PATIENT': router.push('/patient'); break;
          default: router.push('/');
        }
        return response;
      },
      {
        showSuccessToast: false, // Handled manually above
        errorFallbackMsg: t('login.failed'),
      }
    ).finally(() => setLoading(false));
  };

  const register = async (data: RegisterRequest) => {
    return execute(
      async () => {
        setLoading(true);
        const response = await authApi.register(data);
        if (!response.success) throw new Error(response.message || 'Registration failed');
        
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return response;
      },
      {
        onSuccessMsg: t('register.success'),
        errorFallbackMsg: t('register.failed'),
      }
    ).finally(() => setLoading(false));
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
    return execute(
      async () => {
        setLoading(true);
        const response = await authApi.verifyEmail({ email, code: otp });
        setTimeout(() => router.push('/login'), 2000);
        return response;
      },
      {
        onSuccessMsg: t('verify.success'),
        errorFallbackMsg: t('verify.failed'),
      }
    ).finally(() => setLoading(false));
  };

  const resendVerification = async (email: string) => {
    return execute(
      async () => {
        setLoading(true);
        return await authApi.resendVerification(email);
      },
      {
        onSuccessMsg: t('verify.resendSuccess'),
        errorFallbackMsg: t('verify.resendFailed'),
      }
    ).finally(() => setLoading(false));
  };

  const forgotPassword = async (email: string) => {
    return execute(
      async () => {
        setLoading(true);
        return await authApi.forgotPassword(email);
      },
      {
        onSuccessMsg: t('forgotPassword.success'),
        errorFallbackMsg: t('forgotPassword.failed'),
      }
    ).finally(() => setLoading(false));
  };

  const verifyResetOtp = async (email: string, code: string) => {
    return execute(
      async () => {
        setLoading(true);
        return await authApi.verifyResetOtp(email, code);
      },
      {
        onSuccessMsg: t('forgotPassword.verifyOtpSuccess'),
        errorFallbackMsg: t('forgotPassword.verifyOtpFailed'),
      }
    ).finally(() => setLoading(false));
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    return execute(
      async () => {
        setLoading(true);
        return await authApi.resetPassword(email, code, newPassword);
      },
      {
        onSuccessMsg: t('forgotPassword.resetSuccess'),
        errorFallbackMsg: t('forgotPassword.resetFailed'),
      }
    ).finally(() => setLoading(false));
  };

  return {
    user,
    isAuthenticated,
    isLoading: storeLoading || actionLoading,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
  };
};
