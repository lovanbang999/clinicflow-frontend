'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { usersApi } from '@/lib/api/auth/users';
import { CircleNotchIcon, UserIcon, HeartbeatIcon, KeyIcon } from '@phosphor-icons/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PatientPersonalInfoForm } from '@/components/patient/profile/PatientPersonalInfoForm';
import { PatientMedicalInfoForm } from '@/components/patient/profile/PatientMedicalInfoForm';
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
        void error;
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
    <div className="max-w-4xl mx-auto px-4 py-2 md:py-6">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        {t('title')}
      </h1>

      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl h-auto sm:h-11">
          <TabsTrigger value="personal" className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-4 py-2.5 sm:py-2 rounded-lg text-[10px] sm:text-sm transition-all duration-200 cursor-pointer w-full text-center leading-tight">
            <UserIcon weight="bold" className="text-base" />
            <span>{t('accountInfo')}</span>
          </TabsTrigger>

          <TabsTrigger value="medical" className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-4 py-2.5 sm:py-2 rounded-lg text-[10px] sm:text-sm transition-all duration-200 cursor-pointer w-full text-center leading-tight">
            <HeartbeatIcon weight="bold" className="text-base" />
            <span>{t('medicalInfo')}</span>
          </TabsTrigger>

          <TabsTrigger value="password" className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 px-1 sm:px-4 py-2.5 sm:py-2 rounded-lg text-[10px] sm:text-sm transition-all duration-200 cursor-pointer w-full text-center leading-tight">
            <KeyIcon weight="bold" className="text-base" />
            <span>{t('changePassword')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
          <PatientPersonalInfoForm user={user} />
        </TabsContent>

        <TabsContent value="medical" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
          <PatientMedicalInfoForm user={user} />
        </TabsContent>

        <TabsContent value="password" className="mt-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
          <PatientChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
