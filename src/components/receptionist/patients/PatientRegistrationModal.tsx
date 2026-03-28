'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  UserPlusIcon, 
  CircleNotchIcon
} from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RegisterPatientDto, CreateGuestPatientDto } from '@/lib/api/users';
import { cn } from '@/lib/utils';

type PatientRegistrationModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitStandard: (data: RegisterPatientDto) => Promise<void>;
  onSubmitGuest: (data: CreateGuestPatientDto) => Promise<void>;
  initialTab?: 'standard' | 'guest';
};

export function PatientRegistrationModal({
  open,
  onClose,
  onSubmitStandard,
  onSubmitGuest,
  initialTab = 'standard',
}: PatientRegistrationModalProps) {
  const t = useTranslations('dashboard.receptionist.patientManagement.registrationModal');
  const [activeTab, setActiveTab] = useState<'standard' | 'guest'>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '' as 'MALE' | 'FEMALE' | 'OTHER' | '',
    address: '',
    nationalId: '',
    bloodType: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = t('validation.fullNameRequired');
    if (!formData.phone.trim()) newErrors.phone = t('validation.phoneRequired');

    if (activeTab === 'standard') {
      if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
      if (!formData.dateOfBirth) newErrors.dateOfBirth = t('validation.dobRequired');
      if (!formData.gender) newErrors.gender = t('validation.genderRequired');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'standard') {
        await onSubmitStandard({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER',
          address: formData.address || undefined,
          nationalId: formData.nationalId || undefined,
          bloodType: formData.bloodType || undefined,
        });
      } else {
        await onSubmitGuest({
          fullName: formData.fullName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: (formData.gender as 'MALE' | 'FEMALE' | 'OTHER') || undefined,
          address: formData.address || undefined,
          nationalId: formData.nationalId || undefined,
          bloodType: formData.bloodType || undefined,
        });
      }
      handleClose();
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      nationalId: '',
      bloodType: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center">
              <UserPlusIcon size={24} weight="fill" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#111518]">{t('title')}</DialogTitle>
              <p className="text-sm text-[#64748b]">{t('subtitle')}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4">
          {/* Tabs */}
          <div className="flex p-1 bg-[#f6f7f8] rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('guest')}
              className={cn(
                'flex-1 py-2 text-sm font-bold rounded-lg transition-all',
                activeTab === 'guest'
                  ? 'bg-white text-[#1392ec] shadow-sm'
                  : 'text-[#64748b] hover:text-[#111518]'
              )}
            >
              {t('tabs.guest')}
            </button>
            <button
              onClick={() => setActiveTab('standard')}
              className={cn(
                'flex-1 py-2 text-sm font-bold rounded-lg transition-all',
                activeTab === 'standard'
                  ? 'bg-white text-[#1392ec] shadow-sm'
                  : 'text-[#64748b] hover:text-[#111518]'
              )}
            >
              {t('tabs.standard')}
            </button>
          </div>

          <form id="registration-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.fullName')}
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 outline-none transition-all",
                    errors.fullName ? "border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:ring-[#1392ec]/20 focus:border-[#1392ec]"
                  )}
                  placeholder={t('form.placeholders.fullName')}
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.phone')}
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 outline-none transition-all",
                    errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:ring-[#1392ec]/20 focus:border-[#1392ec]"
                  )}
                  placeholder={t('form.placeholders.phone')}
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.email')} {activeTab === 'standard' && '(*)'}
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 outline-none transition-all",
                    errors.email ? "border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:ring-[#1392ec]/20 focus:border-[#1392ec]"
                  )}
                  placeholder={t('form.placeholders.email')}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.dob')} {activeTab === 'standard' && '(*)'}
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 outline-none transition-all",
                    errors.dateOfBirth ? "border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:ring-[#1392ec]/20 focus:border-[#1392ec]"
                  )}
                />
                {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.gender')} {activeTab === 'standard' && '(*)'}
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 outline-none transition-all",
                    errors.gender ? "border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:ring-[#1392ec]/20 focus:border-[#1392ec]"
                  )}
                >
                  <option value="">{t('form.genderOptions.select')}</option>
                  <option value="MALE">{t('form.genderOptions.male')}</option>
                  <option value="FEMALE">{t('form.genderOptions.female')}</option>
                  <option value="OTHER">{t('form.genderOptions.other')}</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.address')}
                </label>
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  placeholder={t('form.placeholders.address')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.nationalId')}
                </label>
                <input
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  placeholder={t('form.placeholders.nationalId')}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5">
                  {t('form.bloodType')}
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                >
                  <option value="">{t('form.bloodTypeOptions.unknown')}</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-[#f8fafc]">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-bold text-[#64748b] hover:bg-[#e5e7eb]/50 rounded-xl transition-all cursor-pointer"
          >
            {t('actions.cancel')}
          </button>
          <button
            form="registration-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 bg-[#1392ec] text-white text-sm font-bold rounded-xl hover:bg-[#1180d0] transition-all shadow-lg shadow-[#1392ec]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <CircleNotchIcon className="animate-spin" size={18} weight="bold" />
                {t('actions.registering')}
              </>
            ) : (
              t('actions.register')
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
