'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { NotificationConfig } from '@/lib/api/settings';
import { Switch } from '@/components/ui/switch';

interface NotificationsTabProps {
  data: NotificationConfig;
  onSave: (data: Partial<NotificationConfig>) => Promise<void>;
  loading: boolean;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({ data, onSave, loading }) => {
  const t = useTranslations('adminSettings');
  const [formData, setFormData] = React.useState<NotificationConfig>(data);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
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
          <span className="w-2 h-8 bg-orange-500 rounded-full" />
          {t('notifications')}
        </CardTitle>
        <CardDescription>
          {t('notificationsDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Delivery Channels */}
            <div className="space-y-4 col-span-full">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('deliveryChannels')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-slate-800">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">{t('emailNotif')}</Label>
                    <p className="text-sm text-slate-500">{t('emailNotifDesc')}</p>
                  </div>
                  <Switch
                    checked={formData.enableEmailReminders}
                    onCheckedChange={(val: boolean) => handleSwitchChange('enableEmailReminders', val)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-slate-800 opacity-60">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">{t('smsNotif')}</Label>
                    <p className="text-sm text-slate-500">{t('smsNotifUpcoming')}</p>
                  </div>
                  <Switch
                    disabled
                    checked={formData.enableSmsReminders}
                    onCheckedChange={(val: boolean) => handleSwitchChange('enableSmsReminders', val)}
                  />
                </div>
              </div>
            </div>


            {/* Reminder Schedule */}
            <div className="space-y-4 col-span-full">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('reminderSchedule')}</h3>
              <div className="space-y-2">
                <Label htmlFor="reminderSchedule">{t('reminderHours')}</Label>
                <Input
                  id="reminderSchedule"
                  name="reminderSchedule"
                  value={formData.reminderSchedule || ''}
                  onChange={handleChange}
                  placeholder="24, 2, 1"
                  className="bg-white dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 italic">
                  * {t('reminderHint')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
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
