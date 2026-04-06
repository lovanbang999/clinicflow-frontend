'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useAuthStore } from '@/lib/store/authStore';
import { usersApi } from '@/lib/api/auth/users';
import { CircleNotchIcon } from '@phosphor-icons/react';

import { PatientPersonalInfoForm } from '@/components/patient/profile/PatientPersonalInfoForm';
import { PatientChangePasswordForm } from '@/components/patient/profile/PatientChangePasswordForm';

export default function PatientProfilePage() {
  const t = useTranslations('common.profile');
  const { user, setUser } = useAuthStore();
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const profile = await usersApi.getMyProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error(t('cannotLoadProfile'));
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isFetching || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <CircleNotchIcon className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{t('loadingInfo')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4 md:mb-8">{t('title')}</h1>
      
      <div className="space-y-4 md:space-y-8">
        <PatientPersonalInfoForm user={user} />
        <PatientChangePasswordForm />
      </div>
    </div>
  );
}
