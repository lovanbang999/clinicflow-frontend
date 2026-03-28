'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/lib/hooks/useProfile';
import { LockKeyIcon, FloppyDiskIcon, CircleNotchIcon, EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

const inputClassName = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none";

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
        toast.error(t('passwordMismatch'), { description: "Please enter your current password" });
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
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <LockKeyIcon weight="fill" className="text-amber-500 text-xl" /> 
        {t('changePassword')}
      </h3>
      
      <form onSubmit={handlePasswordSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-2 max-w-md">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('currentPassword')}</label>
            <div className="relative">
              <input 
                disabled={isLoading}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={inputClassName} 
                placeholder="••••••••" 
                type={showCurrentPassword ? "text" : "password"}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('newPassword')}</label>
              <div className="relative">
                <input 
                  disabled={isLoading}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className={inputClassName} 
                  placeholder="••••••••" 
                  type={showNewPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('confirmPassword')}</label>
              <div className="relative">
                <input 
                  disabled={isLoading}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className={inputClassName} 
                  placeholder="••••••••" 
                  type={showConfirmPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={handlePasswordCancel}
            disabled={isLoading}
            className="px-8 py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {tCommon('cancel')}
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="px-8 py-3 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <CircleNotchIcon className="animate-spin text-xl" />
            ) : (
              <FloppyDiskIcon weight="fill" className="text-xl" />
            )}
            {t('saveChanges')}
          </button>
        </div>
      </form>
    </div>
  );
}
