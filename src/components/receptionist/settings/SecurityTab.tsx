'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/lib/hooks/useProfile';
import { toast } from 'sonner';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const SecurityTab: React.FC = () => {
  const t = useTranslations('receptionistSettings.security');
  const { isLoading, changePassword } = useProfile();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 6) {
      toast.error(t('passwordMinLength'));
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch {
      // Error handled in hook toast
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
         <ShieldAlert className="w-64 h-64 -mr-16 -mt-16 rotate-12" />
      </div>

      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <span className="w-2 h-8 bg-emerald-500 rounded-full" />
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('desc')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-slate-50 dark:bg-slate-800"
                required
              />
            </div>
            
            <div className="space-y-2 pt-2">
              <Label htmlFor="newPassword">{t('newPassword')}</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-slate-50 dark:bg-slate-800 focus-visible:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-slate-50 dark:bg-slate-800 focus-visible:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[160px] rounded-xl h-11"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('savingBtn')}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  {t('saveBtn')}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
