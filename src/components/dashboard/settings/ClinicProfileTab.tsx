'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { ClinicProfile } from '@/lib/api/settings';

interface ClinicProfileTabProps {
  data: ClinicProfile;
  onSave: (data: Partial<ClinicProfile>) => Promise<void>;
  loading: boolean;
}

export const ClinicProfileTab: React.FC<ClinicProfileTabProps> = ({ data, onSave, loading }) => {
  const t = useTranslations('dashboard.admin.settings');
  const [formData, setFormData] = React.useState<ClinicProfile>(data);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-blue-500 rounded-full" />
          {t('clinicProfile')}
        </CardTitle>
        <CardDescription>
          {t('clinicProfileDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('clinicName')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="SmartClinic Central"
                className="bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">{t('taxId')}</Label>
              <Input
                id="taxId"
                name="taxId"
                value={formData.taxId || ''}
                onChange={handleChange}
                placeholder="MST-12345678"
                className="bg-white dark:bg-slate-800"
              />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="123 Hospital St, Health District"
                className="bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="+84 123 456 789"
                className="bg-white dark:bg-slate-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="contact@clinic.com"
                className="bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t('saveChanges')
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
