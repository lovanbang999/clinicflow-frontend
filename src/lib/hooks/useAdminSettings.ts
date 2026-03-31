'use client';

import { useState, useEffect, useCallback } from 'react';
import { settingsApi, AdminSettings, ClinicProfile, BookingRules, NotificationConfig } from '@/lib/api/settings';
import { useTranslations } from 'next-intl';
import { useApiHandler } from './useApiHandler';

export const useAdminSettings = () => {
  const t = useTranslations('dashboard.admin.settings');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const { execute, isLoading: loading } = useApiHandler();
  const { execute: executeSave, isLoading: saving } = useApiHandler();

  const fetchSettings = useCallback(async () => {
    const data = await execute(() => settingsApi.getAllSettings());
    if (data) {
      setSettings(data);
    }
  }, [execute]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateClinicProfile = async (data: Partial<ClinicProfile>): Promise<void> => {
    await executeSave(() => settingsApi.updateClinicProfile(data), {
      onSuccessMsg: t('saveSuccess'),
      onSuccess: (updated) => {
        setSettings(prev => prev ? { ...prev, clinic: updated } : null);
      }
    });
  };

  const updateBookingRules = async (data: Partial<BookingRules>): Promise<void> => {
    await executeSave(() => settingsApi.updateBookingRules(data), {
      onSuccessMsg: t('saveSuccess'),
      onSuccess: (updated) => {
        setSettings(prev => prev ? { ...prev, booking: updated } : null);
      }
    });
  };

  const updateNotifications = async (data: Partial<NotificationConfig>): Promise<void> => {
    await executeSave(() => settingsApi.updateNotifications(data), {
      onSuccessMsg: t('saveSuccess'),
      onSuccess: (updated) => {
        setSettings(prev => prev ? { ...prev, notification: updated } : null);
      }
    });
  };

  return {
    settings,
    loading,
    saving,
    updateClinicProfile,
    updateBookingRules,
    updateNotifications,
    refetch: fetchSettings
  };
};
