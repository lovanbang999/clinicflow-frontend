import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { usersApi } from '@/lib/api/users';
import { useAuthStore } from '@/lib/store/authStore';
import type { ApiError, UpdateProfileDto } from '@/types';
import { showApiErrorToast } from '../utils/toast-error';

export function useProfile() {
  const t = useTranslations('dashboard'); // or create "profile" namespace if you want
  const tErrors = useTranslations('errors');

  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (payload: UpdateProfileDto) => {
    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateMyProfile(payload);
      setUser(updatedUser);

      toast.success(t('profile.updateSuccess'), {
        description: t('profile.updateSuccessDescription'),
      });

      return updatedUser;
    } catch (error) {
      const err = error as ApiError;
      showApiErrorToast(err, tErrors, {
        title: t('common.errorTitle'),
        fallbackKey: 'generic',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      setIsLoading(true);

      // IMPORTANT: this should return {url, publicId} or string url depending your design
      const res = await usersApi.uploadAvatar(file);

      toast.success(t('profile.avatarUploadSuccess'), {
        description: t('profile.avatarUploadSuccessDescription'),
      });

      return res; // string url OR { url, publicId }
    } catch (error) {
      const err = error as ApiError;
      showApiErrorToast(err, tErrors, {
        title: t('common.errorTitle'),
        fallbackKey: 'generic',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (payload: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      setIsLoading(true);
      await usersApi.changePassword(payload);

      toast.success(t('profile.passwordChangeSuccess'), {
        description: t('profile.passwordChangeSuccessDescription'),
      });
    } catch (error) {
      const err = error as ApiError;
      showApiErrorToast(err, tErrors, {
        title: t('profile.passwordChangeFailedTitle'),
        fallbackKey: 'generic',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, updateProfile, uploadAvatar, changePassword };
}
