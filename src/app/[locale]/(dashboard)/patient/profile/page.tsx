'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Camera, Lock, Save, X, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useAuthStore } from '@/lib/store/authStore';
import { usersApi } from '@/lib/api/users';
import { useProfile } from '@/lib/hooks/useProfile';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { UpdateProfileDto, Gender } from '@/types';

export default function PatientProfilePage() {
  const t = useTranslations('common.profile');
  const tCommon = useTranslations('common');
  const { user, setUser } = useAuthStore();
  const { isLoading, updateProfile, uploadAvatar, changePassword } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [formData, setFormData] = useState<UpdateProfileDto>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!user?.fullName) return '';
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [user?.fullName]);

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

  // supports: preview -> cloudinary full url -> old local "/uploads/.."
  const avatarSrc = useMemo(() => {
    if (avatarPreview) return avatarPreview;

    const avatar = user?.avatar;
    if (!avatar) return null;

    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;

    const base = process.env.NEXT_PUBLIC_ASSET_URL ?? '';
    return `${base}${avatar}`;
  }, [avatarPreview, user?.avatar]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const profile = await usersApi.getMyProfile();

        setUser(profile);
        setFormData({
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone || '',
          dateOfBirth: formatDateForInput(profile.dateOfBirth),
          gender: profile.gender,
          address: profile.address || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error(t('cannotLoadProfile'));

        // fallback (optional)
        if (user) {
          setFormData({
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || '',
            dateOfBirth: formatDateForInput(user.dateOfBirth),
            gender: user.gender,
            address: user.address || '',
          });
        }
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: formatDateForInput(user.dateOfBirth),
        gender: user.gender,
        address: user.address || '',
      });
    }
  }, [user, isEditing]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let avatarUrl = user?.avatar;

      // upload avatar (via hook)
      if (avatarFile) {
        const uploaded = await uploadAvatar(avatarFile);

        // hook says: string OR { url, publicId }
        avatarUrl =
          typeof uploaded === 'string'
            ? uploaded
            : (uploaded as { url: string }).url;
      }

      // update profile (via hook)
      await updateProfile({
        ...formData,
        avatar: avatarUrl,
      });

      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      // toast is handled inside hook (showApiErrorToast)
      console.error('Update profile error:', err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('passwordMismatch'));
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(t('passwordTooShort'));
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordSection(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // toast is handled inside hook (showApiErrorToast)
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: formatDateForInput(user?.dateOfBirth),
      gender: user?.gender,
      address: user?.address || '',
    });

    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  if (isFetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-slate-600">{t('loadingInfo')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl">{t('accountInfo')}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-linear-to-br from-blue-500 to-cyan-600 text-2xl font-bold text-white shadow-lg">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={user?.fullName || 'Avatar'}
                      width={96}
                      height={96}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {isEditing && (
                  <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={isLoading}
                    />
                  </label>
                )}
              </div>

              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  {t('editProfile')}
                </Button>
              )}
            </div>

            {/* Personal Info */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {t('fullName')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  disabled={!isEditing || isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('email')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing || isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing || isLoading}
                  placeholder={t('phonePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t('dateOfBirth')}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  disabled={!isEditing || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t('gender')}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value as Gender })
                  }
                  disabled={!isEditing || isLoading}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder={t('selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">{t('male')}</SelectItem>
                    <SelectItem value="FEMALE">{t('female')}</SelectItem>
                    <SelectItem value="OTHER">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing || isLoading}
                  placeholder={t('addressPlaceholder')}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {tCommon('loading')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveChanges')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  {tCommon('cancel')}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5" />
            {t('changePassword')}
          </CardTitle>
        </CardHeader>

        <CardContent>
          {!showPasswordSection ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordSection(true)}
            >
              {t('changePassword')}
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {tCommon('loading')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('saveChanges')}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  {tCommon('cancel')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
