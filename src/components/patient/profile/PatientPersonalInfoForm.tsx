'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { useProfile } from '@/lib/hooks/useProfile';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FloppyDiskIcon, CircleNotchIcon, MagnifyingGlassPlusIcon } from '@phosphor-icons/react';
import type { UpdateProfileDto, Gender, User } from '@/types';

interface PatientPersonalInfoFormProps {
  user: User;
}

const inputClassName = "w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none";

const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

export function PatientPersonalInfoForm({ user }: PatientPersonalInfoFormProps) {
  const t = useTranslations('common.profile');
  const tCommon = useTranslations('common');
  const { isLoading, updateProfile, uploadAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UpdateProfileDto>({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: formatDateForInput(user.dateOfBirth),
    gender: user.gender as Gender | undefined,
    address: user.address || '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: formatDateForInput(user.dateOfBirth),
      gender: user.gender as Gender | undefined,
      address: user.address || '',
    });
  }, [user]);

  const initials = useMemo(() => {
    if (!user?.fullName) return '';
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user.fullName]);

  const avatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;

    const avatar = user?.avatar;
    if (!avatar) return null;

    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;

    const base = process.env.NEXT_PUBLIC_ASSET_URL ?? '';
    return `${base}${avatar}`;
  }, [avatarPreview, user.avatar]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('imageTooLarge'), { description: t('imageTooLargeDesc') });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error(t('invalidFile'), { description: t('invalidFileDesc') });
      return;
    }

    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }

      await updateProfile(formData);

      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  const handleProfileCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: formatDateForInput(user?.dateOfBirth),
      gender: user?.gender as Gender | undefined,
      address: user?.address || '',
    });
    
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col items-center mb-8 md:mb-12">
        {avatarSrc ? (
          <Dialog>
            <DialogTrigger asChild>
              <div className="w-32 h-32 rounded-full overflow-hidden mb-4 shadow-xl shadow-blue-500/10 ring-4 ring-white dark:ring-slate-800 relative group cursor-pointer transition-transform hover:scale-105">
                 <Image
                  src={avatarSrc}
                  alt={user?.fullName || 'Avatar'}
                  width={128}
                  height={128}
                  unoptimized
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <MagnifyingGlassPlusIcon weight="bold" className="text-white text-3xl" />
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-transparent border-none shadow-none flex items-center justify-center [&>button]:text-white [&>button]:bg-black/50 [&>button]:hover:bg-black/80 [&>button]:rounded-full [&>button]:p-2">
              <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden ring-4 ring-white/50 shadow-2xl">
                <Image
                  src={avatarSrc}
                  alt={user?.fullName || 'Avatar'}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-xl shadow-blue-500/10 ring-4 ring-white dark:ring-slate-800 relative group">
            {initials}
          </div>
        )}
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          disabled={isLoading}
        />
        
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          {t('changeAvatar')}
        </button>
      </div>

      <form className="space-y-10" onSubmit={handleProfileSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('fullName')} <span className="text-red-500">*</span>
            </label>
            <input 
              required
              disabled={isLoading}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={inputClassName} 
              type="text" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('email')} <span className="text-red-500">*</span>
            </label>
            <input 
              required
              disabled={isLoading}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={inputClassName} 
              type="email" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('phone')}</label>
            <input 
              disabled={isLoading}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t('phonePlaceholder')}
              className={inputClassName} 
              type="tel" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('dateOfBirth')}</label>
            <input 
              disabled={isLoading}
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className={inputClassName} 
              type="date" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('gender')}</label>
            <select 
              disabled={isLoading}
              value={formData.gender || ""}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
              className={inputClassName}
            >
              <option value="" disabled>{t('selectGender')}</option>
              <option value="MALE">{t('male')}</option>
              <option value="FEMALE">{t('female')}</option>
              <option value="OTHER">{t('other')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">{t('address')}</label>
            <input 
              disabled={isLoading}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={t('addressPlaceholder')}
              className={inputClassName} 
              type="text" 
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button 
            type="button" 
            onClick={handleProfileCancel}
            disabled={isLoading}
            className="text-sm md:text-base px-4 md:px-8 py-2 md:py-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {tCommon('cancel')}
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="text-sm md:text-base px-4 md:px-8 py-2 md:py-3 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
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
