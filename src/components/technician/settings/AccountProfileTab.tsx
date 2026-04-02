'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/lib/hooks/useProfile';
import { UpdateProfileDto } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export const AccountProfileTab: React.FC = () => {
  const t = useTranslations('technicianWorklist.settingsContent.account');
  const { user, isLoading, fetchProfile, updateProfile } = useProfile();
  const [formData, setFormData] = useState<UpdateProfileDto>({});
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await fetchProfile();
        setFormData({
          fullName: profile?.fullName ?? '',
          phone: profile?.phone ?? '',
          address: profile?.address ?? '',
        });
      } catch {
        // Error handled in hook toast
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
    } catch {
      // Error handled in hook toast
    }
  };

  if (initialLoading) {
    return (
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-[#1392ec] rounded-full" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                placeholder={t('fullNamePlaceholder')}
                className="bg-slate-50 dark:bg-slate-800"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder={t('phonePlaceholder')}
                className="bg-slate-50 dark:bg-slate-800"
                required
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder={t('addressPlaceholder')}
                className="bg-slate-50 dark:bg-slate-800"
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                value={user?.email || ''}
                readOnly
                className="bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white min-w-[140px] rounded-xl h-11"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('savingBtn')}
                </div>
              ) : (
                t('saveBtn')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
