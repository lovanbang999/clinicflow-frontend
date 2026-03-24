'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LockSimpleIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

interface SecurityTabProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  onSave: () => void;
  savingPassword: boolean;
}

export function SecurityTab({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onSave,
  savingPassword,
}: SecurityTabProps) {
  const t = useTranslations('dashboard.doctorSettings.security');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('title')}</h2>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('currentPassword')}</label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('newPassword')}</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('confirmPassword')}</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button
          onClick={onSave}
          disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
          className="bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer gap-2 rounded-xl"
        >
          <LockSimpleIcon size={16} weight="bold" />
          {savingPassword ? t('saving') : t('saveBtn')}
        </Button>
      </div>
    </div>
  );
}
