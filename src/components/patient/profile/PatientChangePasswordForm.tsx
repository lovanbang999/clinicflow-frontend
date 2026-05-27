'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/lib/hooks/auth/useProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { LockKeyIcon, FloppyDiskIcon, CircleNotchIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

export function PatientChangePasswordForm() {
  const t = useTranslations('common.profile');
  const tCommon = useTranslations('common');
  const { isLoading, changePassword } = useProfile();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!passwordData.currentPassword) {
        toast.error(t('currentPasswordRequired'));
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error(t('passwordMismatch'));
        return;
      }
      if (passwordData.newPassword.length < 6) {
        toast.error(t('passwordTooShort'));
        return;
      }
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Change password error:', err);
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
        <LockKeyIcon weight="fill" className="text-amber-500 text-xl" /> 
        {t('changePassword')}
      </h3>
      
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('currentPassword')}</Label>
            <div className="relative">
              <Input 
                disabled={isLoading}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus-visible:ring-[3px] transition-all"
                placeholder="••••••••" 
                type={showCurrentPassword ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('newPassword')}</Label>
              <div className="relative">
                <Input 
                  disabled={isLoading}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus-visible:ring-[3px] transition-all"
                  placeholder="••••••••" 
                  type={showNewPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('confirmPassword')}</Label>
              <div className="relative">
                <Input 
                  disabled={isLoading}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus-visible:ring-[3px] transition-all"
                  placeholder="••••••••" 
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
          <Button 
            type="button" 
            variant="outline"
            onClick={handlePasswordCancel}
            disabled={isLoading}
            className="w-full sm:w-auto text-sm md:text-base px-4 md:px-8 py-6 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {tCommon('cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto text-sm md:text-base px-4 md:px-8 py-6 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <CircleNotchIcon className="animate-spin text-xl" />
            ) : (
              <FloppyDiskIcon weight="fill" className="text-xl" />
            )}
            {t('saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
