'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FloppyDiskIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

interface PersonalInfoTabProps {
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  onSave: () => void;
  savingProfile: boolean;
  isLoading: boolean;
}

export function PersonalInfoTab({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  onSave,
  savingProfile,
  isLoading,
}: PersonalInfoTabProps) {
  const t = useTranslations('dashboard.doctorSettings.personal');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('title')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('fullName')}</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-10 rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('phone')}</label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-10 rounded-xl"
            placeholder={t('phonePlaceholder')}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('email')}</label>
          <Input
            value={email}
            disabled
            className="h-10 rounded-xl bg-slate-50 text-slate-400"
          />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <Button
          onClick={onSave}
          disabled={savingProfile || isLoading}
          className="bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer gap-2 rounded-xl"
        >
          <FloppyDiskIcon size={16} weight="bold" />
          {savingProfile ? t('saving') : t('saveBtn')}
        </Button>
      </div>
    </div>
  );
}
