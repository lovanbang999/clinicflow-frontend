'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  PencilSimpleIcon, 
  CircleNotchIcon
} from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { User, Gender } from '@/types';
import { RegisterPatientDto } from '@/lib/api/users';
import { cn } from '@/lib/utils';

type PatientEditModalProps = {
  open: boolean;
  patient: User | null;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<RegisterPatientDto & { 
    bloodType?: string; 
    nationalId?: string; 
    insuranceNumber?: string;
    insuranceProvider?: string;
    insuranceExpiry?: string;
    allergies?: string;
    chronicConditions?: string;
    familyHistory?: string;
  }>) => Promise<void>;
};

export function PatientEditModal({
  open,
  patient,
  onClose,
  onSubmit,
}: PatientEditModalProps) {
  const t = useTranslations('dashboard.receptionist.patientManagement.editModal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    gender: '' as Gender | '',
    address: '',
    nationalId: '',
    bloodType: '',
    insuranceNumber: '',
    insuranceProvider: '',
    insuranceExpiry: '',
    allergies: '',
    chronicConditions: '',
    familyHistory: '',
  });

  useEffect(() => {
    if (patient && patient.patientProfile) {
      const profile = patient.patientProfile;
      setFormData({
        fullName: patient.fullName || '',
        phone: patient.phone || '',
        email: patient.email || '',
        dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
        gender: patient.gender || '',
        address: patient.address || '',
        nationalId: profile.nationalId || '',
        bloodType: profile.bloodType || '',
        insuranceNumber: profile.insuranceNumber || '',
        insuranceProvider: profile.insuranceProvider || '',
        insuranceExpiry: profile.insuranceExpiry ? profile.insuranceExpiry.split('T')[0] : '',
        allergies: profile.allergies || '',
        chronicConditions: profile.chronicConditions || '',
        familyHistory: profile.familyHistory || '',
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (!patient) return;
    
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên là bắt buộc';
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(patient.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: (formData.gender as Gender) || undefined,
        address: formData.address || undefined,
        nationalId: formData.nationalId || undefined,
        bloodType: formData.bloodType || undefined,
        insuranceNumber: formData.insuranceNumber || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        insuranceExpiry: formData.insuranceExpiry || undefined,
        allergies: formData.allergies || undefined,
        chronicConditions: formData.chronicConditions || undefined,
        familyHistory: formData.familyHistory || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <PencilSimpleIcon size={24} weight="fill" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#111518]">{t('title')}</DialogTitle>
              <p className="text-sm text-[#64748b]">{t('subtitle')}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <form id="edit-patient-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div>
              <h4 className="text-xs font-bold text-[#1392ec] uppercase tracking-widest mb-4">Thông tin cơ bản</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">HỌ VÀ TÊN (*)</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 outline-none transition-all",
                      errors.fullName ? "border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:ring-[#1392ec]/20 focus:border-[#1392ec]"
                    )}
                  />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">SỐ ĐIỆN THOẠI (*)</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={cn(
                      "w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:ring-2 outline-none transition-all",
                      errors.phone ? "border-red-500 focus:ring-red-500/20" : "border-[#e5e7eb] focus:ring-[#1392ec]/20 focus:border-[#1392ec]"
                    )}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">EMAIL</label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">NGÀY SINH</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">GIỚI TÍNH</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">ĐỊA CHỈ</label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Medical & Insurance Section */}
            <div>
              <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Y tế & Bảo hiểm</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">SỐ CCCD / CMND</label>
                  <input
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">NHÓM MÁU</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  >
                    <option value="">Không rõ</option>
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
                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">SỐ THẺ BHYT</label>
                  <input
                    name="insuranceNumber"
                    value={formData.insuranceNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">NHÀ CUNG CẤP BH</label>
                  <input
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                    placeholder="VD: BHYT Việt Nam, Bảo Việt..."
                  />
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">HẾT HẠN BẢO HIỂM</label>
                   <input
                    type="date"
                    name="insuranceExpiry"
                    value={formData.insuranceExpiry}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">DỊ ỨNG</label>
                  <textarea
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all resize-none"
                    placeholder="VD: Hải sản, Paracetamol..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-[#64748b] mb-1.5 px-0.5">BỆNH LÝ MÃN TÍNH</label>
                  <textarea
                    name="chronicConditions"
                    value={formData.chronicConditions}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 bg-white border border-[#e5e7eb] rounded-xl text-sm focus:ring-2 focus:ring-[#1392ec]/20 focus:border-[#1392ec] outline-none transition-all resize-none"
                    placeholder="VD: Cao huyết áp, Tiểu đường..."
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-[#f8fafc]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-[#64748b] hover:bg-[#e5e7eb]/50 rounded-xl transition-all cursor-pointer"
          >
            {t('actions.cancel')}
          </button>
          <button
            form="edit-patient-form"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <CircleNotchIcon className="animate-spin" size={18} weight="bold" />
                {t('actions.saving')}
              </>
            ) : (
              t('actions.save')
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
