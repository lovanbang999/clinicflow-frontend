'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslations } from 'next-intl';
import { BookingRules } from '@/lib/api/settings';

interface BookingRulesTabProps {
  data: BookingRules;
  onSave: (data: Partial<BookingRules>) => Promise<void>;
  loading: boolean;
}

export const BookingRulesTab: React.FC<BookingRulesTabProps> = ({ data, onSave, loading }) => {
  const t = useTranslations('adminSettings');
  const [formData, setFormData] = React.useState<BookingRules>(data);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
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
          <span className="w-2 h-8 bg-green-500 rounded-full" />
          {t('bookingRules')}
        </CardTitle>
        <CardDescription>
          {t('bookingRulesDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Working Hours */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('workingHours')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openTime">{t('openTime')}</Label>
                  <Input
                    id="openTime"
                    name="openTime"
                    type="time"
                    value={formData.openTime || '08:00'}
                    onChange={handleChange}
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closeTime">{t('closeTime')}</Label>
                  <Input
                    id="closeTime"
                    name="closeTime"
                    type="time"
                    value={formData.closeTime || '17:00'}
                    onChange={handleChange}
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Slot Configuration */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('slotConfig')}</h3>
              <div className="space-y-2">
                <Label>{t('slotDuration')}</Label>
                <Select
                  value={String(formData.slotDuration)}
                  onValueChange={(val) => handleSelectChange('slotDuration', val)}
                >
                  <SelectTrigger className="bg-white dark:bg-slate-800">
                    <SelectValue placeholder={t('selectDuration')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 {t('minutes')}</SelectItem>
                    <SelectItem value="20">20 {t('minutes')}</SelectItem>
                    <SelectItem value="30">30 {t('minutes')}</SelectItem>
                    <SelectItem value="45">45 {t('minutes')}</SelectItem>
                    <SelectItem value="60">60 {t('minutes')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Policies */}
            <div className="space-y-4 col-span-full">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{t('policies')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cancelationWindowHours">{t('cancelWindow')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cancelationWindowHours"
                      name="cancelationWindowHours"
                      type="number"
                      value={formData.cancelationWindowHours || 0}
                      onChange={handleChange}
                      className="bg-white dark:bg-slate-800"
                    />
                    <span className="text-sm text-slate-500">{t('hours')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noShowGraceMinutes">{t('gracePeriod')}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="noShowGraceMinutes"
                      name="noShowGraceMinutes"
                      type="number"
                      value={formData.noShowGraceMinutes || 0}
                      onChange={handleChange}
                      className="bg-white dark:bg-slate-800"
                    />
                    <span className="text-sm text-slate-500">{t('minutes')}</span>
                  </div>
                </div>
                <div className="flex flex-col justify-end space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-slate-800">
                    <Label htmlFor="allowOnlineBooking" className="cursor-pointer">
                      {t('allowOnline')}
                    </Label>
                    <Switch
                      id="allowOnlineBooking"
                      checked={formData.allowOnlineBooking}
                      onCheckedChange={(val: boolean) => handleSwitchChange('allowOnlineBooking', val)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
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
