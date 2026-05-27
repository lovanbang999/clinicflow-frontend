'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useProfile } from '@/lib/hooks/auth/useProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FloppyDiskIcon, CircleNotchIcon, HeartbeatIcon } from '@phosphor-icons/react';
import type { User } from '@/types';

interface PatientMedicalInfoFormProps {
  user: User;
}

export function PatientMedicalInfoForm({ user }: PatientMedicalInfoFormProps) {
  const t = useTranslations('common.profile');
  const tCommon = useTranslations('common');
  const { isLoading, updateProfile } = useProfile();

  const profile = user.patientProfile;

  const [formData, setFormData] = useState({
    bloodType: profile?.bloodType || '',
    heightCm: profile?.heightCm !== undefined && profile?.heightCm !== null ? String(profile.heightCm) : '',
    weightKg: profile?.weightKg !== undefined && profile?.weightKg !== null ? String(profile.weightKg) : '',
    allergies: profile?.allergies || '',
    chronicConditions: profile?.chronicConditions || '',
  });

  useEffect(() => {
    const p = user.patientProfile;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      bloodType: p?.bloodType || '',
      heightCm: p?.heightCm !== undefined && p?.heightCm !== null ? String(p.heightCm) : '',
      weightKg: p?.weightKg !== undefined && p?.weightKg !== null ? String(p.weightKg) : '',
      allergies: p?.allergies || '',
      chronicConditions: p?.chronicConditions || '',
    });
  }, [user]);

  const handleMedicalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const height = formData.heightCm ? parseFloat(formData.heightCm) : undefined;
      const weight = formData.weightKg ? parseFloat(formData.weightKg) : undefined;

      await updateProfile({
        bloodType: formData.bloodType || (null as unknown as string),
        heightCm: height,
        weightKg: weight,
        allergies: formData.allergies || (null as unknown as string),
        chronicConditions: formData.chronicConditions || (null as unknown as string),
      });
    } catch (err) {
      console.error('Update medical profile error:', err);
    }
  };

  const handleMedicalCancel = () => {
    const p = user.patientProfile;
    setFormData({
      bloodType: p?.bloodType || '',
      heightCm: p?.heightCm !== undefined && p?.heightCm !== null ? String(p.heightCm) : '',
      weightKg: p?.weightKg !== undefined && p?.weightKg !== null ? String(p.weightKg) : '',
      allergies: p?.allergies || '',
      chronicConditions: p?.chronicConditions || '',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <HeartbeatIcon weight="fill" className="text-rose-500 text-xl animate-pulse" /> 
        {t('medicalInfo')}
      </h3>
      
      <form onSubmit={handleMedicalSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('bloodType')}
            </Label>
            <Select 
              disabled={isLoading}
              value={formData.bloodType || "none"}
              onValueChange={(val) => setFormData({ ...formData, bloodType: val === "none" ? "" : val })}
            >
              <SelectTrigger className="w-full h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-left focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:ring-[3px] focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-[3px] focus-visible:ring-offset-0 transition-all cursor-pointer">
                <SelectValue placeholder={t('selectBloodType')} />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectItem value="none" className="cursor-pointer text-slate-400">{t('selectBloodType')}</SelectItem>
                <SelectItem value="A" className="cursor-pointer">A</SelectItem>
                <SelectItem value="B" className="cursor-pointer">B</SelectItem>
                <SelectItem value="O" className="cursor-pointer">O</SelectItem>
                <SelectItem value="AB" className="cursor-pointer">AB</SelectItem>
                <SelectItem value="Rh+" className="cursor-pointer">Rh+</SelectItem>
                <SelectItem value="Rh-" className="cursor-pointer">Rh-</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('heightCm')}
            </Label>
            <Input
              disabled={isLoading}
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
              placeholder="170"
              className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus-visible:ring-[3px] transition-all"
              type="number"
              step="0.1"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('weightKg')}
            </Label>
            <Input
              disabled={isLoading}
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
              placeholder="65"
              className="h-12 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus-visible:ring-[3px] transition-all"
              type="number"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('allergies')}
            </Label>
            <Textarea
              disabled={isLoading}
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder={t('allergiesPlaceholder')}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus-visible:ring-[3px] transition-all resize-none min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('chronicConditions')}
            </Label>
            <Textarea
              disabled={isLoading}
              value={formData.chronicConditions}
              onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
              placeholder={t('chronicConditionsPlaceholder')}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-0 focus-visible:border-blue-500 focus-visible:ring-[3px] transition-all resize-none min-h-[80px]"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleMedicalCancel}
            disabled={isLoading}
            className="w-full sm:w-auto text-sm px-4 md:px-8 py-6 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto text-sm px-4 md:px-8 py-6 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
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
