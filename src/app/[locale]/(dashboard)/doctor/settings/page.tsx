'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/store/authStore';
import { useProfile } from '@/lib/hooks/useProfile';
import { adminDoctorsApi } from '@/lib/api/admin-doctors';
import { toast } from 'sonner';
import {
  UserCircleIcon,
  CameraIcon,
  LockSimpleIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react';

import { PersonalInfoTab } from '@/components/dashboard/doctors/settings/PersonalInfoTab';
import { ProfessionalTab } from '@/components/dashboard/doctors/settings/ProfessionalTab';
import { SecurityTab } from '@/components/dashboard/doctors/settings/SecurityTab';

export default function DoctorSettingsPage() {
  const t = useTranslations('dashboard.doctorSettings');
  const tProf = useTranslations('dashboard.doctorSettings.professional');
  const tSec = useTranslations('dashboard.doctorSettings.security');
  
  const { user } = useAuthStore();
  const { updateProfile, uploadAvatar, changePassword, isLoading } = useProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal Info
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Doctor Profile
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [newQual, setNewQual] = useState('');
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<'info' | 'professional' | 'security'>('info');

  // Populate doctor profile fields from user data
  useEffect(() => {
    if (user?.doctorProfile) {
      const p = user.doctorProfile;
      setBio(p.bio ?? '');
      setSpecialties(p.specialties ?? []);
      setQualifications(p.qualifications ?? []);
      setYearsOfExperience(p.yearsOfExperience != null ? String(p.yearsOfExperience) : '');
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSavePersonal = async () => {
    setSavingProfile(true);
    try {
      if (avatarFile) {
        await uploadAvatar(avatarFile);
        setAvatarFile(null);
      }
      await updateProfile({ fullName, phone: phone || undefined });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProfessional = async () => {
    if (!user?.id) return;
    setSaveProfileLoading(true);
    try {
      await adminDoctorsApi.updateDoctorProfile(user.id, {
        bio: bio || undefined,
        specialties,
        qualifications,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined,
      });
      toast.success(tProf('successToast'));
    } catch {
      toast.error(tProf('errorToast'));
    } finally {
      setSaveProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(tSec('passwordMismatch'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(tSec('passwordLength'));
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleSpecialty = (sp: string) => {
    setSpecialties((prev) =>
      prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp]
    );
  };

  const addQualification = () => {
    if (!newQual.trim()) return;
    setQualifications((prev) => [...prev, newQual.trim()]);
    setNewQual('');
  };

  const removeQualification = (idx: number) => {
    setQualifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const displayAvatar = avatarPreview ?? user?.avatar ?? null;
  const initials = (user?.fullName ?? 'BS')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto py-6 px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center">
          <UserCircleIcon size={20} weight="duotone" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{t('subtitle')}</p>
        </div>
      </div>

      {/* Avatar + Basic Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {displayAvatar ? (
              <div className="size-20 rounded-full overflow-hidden border-2 border-white shadow-md relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="size-20 object-cover"
                />
              </div>
            ) : (
              <div className="size-20 rounded-full bg-gradient-to-br from-[#1392ec] to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 size-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#1392ec] hover:bg-blue-50 shadow-sm cursor-pointer transition-colors"
            >
              <CameraIcon size={14} weight="bold" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{user?.fullName}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            {specialties.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {specialties.map((sp) => (
                  <span key={sp} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full cursor-default">
                    {sp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {([
          { id: 'info', label: t('tabs.personalInfo'), icon: UserCircleIcon },
          { id: 'professional', label: t('tabs.professionalProfile'), icon: StethoscopeIcon },
          { id: 'security', label: t('tabs.security'), icon: LockSimpleIcon },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === id
                ? 'bg-white text-[#1392ec] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon size={15} weight={activeTab === id ? 'fill' : 'regular'} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <PersonalInfoTab
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          email={user?.email ?? ''}
          onSave={handleSavePersonal}
          savingProfile={savingProfile}
          isLoading={isLoading}
        />
      )}

      {activeTab === 'professional' && (
        <ProfessionalTab
          specialties={specialties}
          toggleSpecialty={toggleSpecialty}
          yearsOfExperience={yearsOfExperience}
          setYearsOfExperience={setYearsOfExperience}
          qualifications={qualifications}
          removeQualification={removeQualification}
          newQual={newQual}
          setNewQual={setNewQual}
          addQualification={addQualification}
          bio={bio}
          setBio={setBio}
          onSave={handleSaveProfessional}
          saveProfileLoading={saveProfileLoading}
        />
      )}

      {activeTab === 'security' && (
        <SecurityTab
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onSave={handleChangePassword}
          savingPassword={savingPassword}
        />
      )}
    </div>
  );
}
