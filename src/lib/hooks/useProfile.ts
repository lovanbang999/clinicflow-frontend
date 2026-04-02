import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/lib/store/authStore';
import type { UpdateProfileDto } from '@/types';
import { useApiHandler } from './useApiHandler';

export function useProfile() {
  const t = useTranslations('common');
  const { setUser, user: authUser } = useAuthStore();
  const { execute, isLoading } = useApiHandler();

  const fetchProfile = useCallback(async () => {
    return execute(
      async () => {
        const profile = await usersApi.getMyProfile();
        setUser(profile);
        return profile;
      },
      {
        errorFallbackMsg: t('errorTitle')
      }
    );
  }, [setUser, t, execute]);

  const updateProfile = useCallback(async (payload: UpdateProfileDto) => {
    return execute(
      async () => {
        const updatedUser = await usersApi.updateMyProfile(payload);
        setUser(updatedUser);
        return updatedUser;
      },
      {
        onSuccess: () => {
          toast.success(t('profile.updateSuccess'), {
            description: t('profile.updateSuccessDescription'),
          });
        },
        errorFallbackMsg: t('errorTitle')
      }
    );
  }, [setUser, t, execute]);

  const uploadAvatar = useCallback(async (file: File) => {
    return execute(
      async () => {
        const res = await usersApi.uploadAvatar(file);
        const user = useAuthStore.getState().user;
        if (user) {
          useAuthStore.getState().setUser({ ...user, avatar: res });
        }
        return res;
      },
      {
        onSuccess: () => {
          toast.success(t('profile.avatarUploadSuccess'), {
            description: t('profile.avatarUploadSuccessDescription'),
          });
        },
        errorFallbackMsg: t('errorTitle')
      }
    );
  }, [t, execute]);

  const changePassword = useCallback(async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return execute(
      async () => {
        await usersApi.changePassword(payload);
      },
      {
        onSuccess: () => {
          toast.success(t('profile.passwordChangeSuccess'), {
            description: t('profile.passwordChangeSuccessDescription'),
          });
        },
        errorFallbackMsg: t('profile.passwordChangeFailedTitle')
      }
    );
  }, [t, execute]);

  return {
    user: authUser,
    isLoading,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    changePassword
  };
}
