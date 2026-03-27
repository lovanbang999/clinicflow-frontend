'use client';

import { useState, useEffect, useCallback } from 'react';
import { settingsApi, AdminSettings, ClinicProfile, BookingRules, NotificationConfig } from '@/lib/api/settings';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export const useAdminSettings = () => {
  const t = useTranslations('dashboard.admin.settings');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getAllSettings();
      setSettings(data);
    } catch (err) {
      console.error('[useAdminSettings]', err);
      toast.error(t('loadError') || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateClinicProfile = async (data: Partial<ClinicProfile>): Promise<void> => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateClinicProfile(data);
      setSettings(prev => prev ? { ...prev, clinic: updated } : null);
      toast.success(t('saveSuccess'));
    } catch (err) {
      toast.error(t('saveError'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateBookingRules = async (data: Partial<BookingRules>): Promise<void> => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateBookingRules(data);
      setSettings(prev => prev ? { ...prev, booking: updated } : null);
      toast.success(t('saveSuccess'));
    } catch (err) {
      toast.error(t('saveError'));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateNotifications = async (data: Partial<NotificationConfig>): Promise<void> => {
    setSaving(true);
    try {
      const updated = await settingsApi.updateNotifications(data);
      setSettings(prev => prev ? { ...prev, notification: updated } : null);
      toast.success(t('saveSuccess'));
    } catch (err) {
      toast.error(t('saveError'));
      throw err;
    } finally {
      setSaving(false);
    }
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
