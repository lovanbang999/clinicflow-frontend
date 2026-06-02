'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PlusIcon, TrashIcon, CircleNotchIcon, PenNibIcon } from '@phosphor-icons/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { AdminUpdatePatientDto } from '@/types';
import type { PatientRow } from '@/components/dashboard/patients/PatientTable';
import { adminPatientsApi } from '@/lib/api/admin/admin-patients';
import { toast } from 'sonner';

interface FullPatientDetail extends PatientRow {
  address?: string;
  email?: string;
  patientProfile?: {
    bloodType?: string;
    familyHistory?: string;
    insuranceProvider?: string;
    insuranceNumber?: string;
    insuranceExpiry?: string;
    allergies?: string;
    chronicConditions?: string;
  };
}

type PatientEditModalProps = {
  open: boolean;
  patientId: string | null;
  onClose: () => void;
  onSubmit: (id: string, data: AdminUpdatePatientDto) => Promise<void>;
};

export function PatientEditModal({ open, patientId, onClose, onSubmit }: PatientEditModalProps) {
  const t = useTranslations('adminPatients.editPatientModal');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    bloodType: '',
    medicalNotes: '',
    insuranceProvider: '',
    insuranceNumber: '',
    insuranceExpiry: '',
  });

  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  useEffect(() => {
    if (open && patientId) {
      const fetchPatient = async () => {
        setIsLoading(true);
        try {
          const res = await adminPatientsApi.getPatientById(patientId);
          // populate form
          const detail = res as unknown as FullPatientDetail;
          const profile = detail.patientProfile || {};
          setFormData({
            fullName: detail.fullName || '',
            dateOfBirth: detail.dateOfBirth ? detail.dateOfBirth.split('T')[0] : '',
            gender: detail.gender || '',
            phone: detail.phone || '',
            email: detail.email || '',
            address: detail.address || '',
            bloodType: profile.bloodType || '',
            medicalNotes: profile.familyHistory || '',
            insuranceProvider: profile.insuranceProvider || '',
            insuranceNumber: profile.insuranceNumber || '',
            insuranceExpiry: profile.insuranceExpiry ? profile.insuranceExpiry.split('T')[0] : '',
          });
          
          setAllergies(
            profile.allergies ? profile.allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : []
          );
          setChronicConditions(
            profile.chronicConditions ? profile.chronicConditions.split(',').map((s: string) => s.trim()).filter(Boolean) : []
          );
        } catch {
          toast.error('Failed to load patient details');
          onClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatient();
    } else if (!open) {
      // Clear form when closed
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        bloodType: '',
        medicalNotes: '',
        insuranceProvider: '',
        insuranceNumber: '',
        insuranceExpiry: '',
      });
      setAllergies([]);
      setChronicConditions([]);
      setErrors({});
    }
  }, [open, patientId, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // clearing specific error when typing
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const handleAddAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies(prev => [...prev, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const handleAddCondition = () => {
    if (conditionInput.trim()) {
      setChronicConditions(prev => [...prev, conditionInput.trim()]);
      setConditionInput('');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});
    
    // Quick validate
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = t('errors.nameRequired');
    if (!formData.dateOfBirth.trim()) newErrors.dateOfBirth = t('errors.dobRequired');
    if (!formData.gender.trim()) newErrors.gender = t('errors.genderRequired');
    if (!formData.phone.trim()) newErrors.phone = t('errors.phoneRequired');
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!patientId) return;

    setIsSubmitting(true);
    
    try {
      const payload: AdminUpdatePatientDto = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER',
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        allergies: allergies.length > 0 ? allergies.join(', ') : '',
        chronicConditions: chronicConditions.length > 0 ? chronicConditions.join(', ') : '',
        familyHistory: formData.medicalNotes,
        insuranceProvider: formData.insuranceProvider,
        insuranceNumber: formData.insuranceNumber,
        insuranceExpiry: formData.insuranceExpiry,
        bloodType: formData.bloodType,
      };
      
      await onSubmit(patientId, payload);
      onClose();
    } catch (err) {
      void err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-full max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-3 mb-1">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <PenNibIcon size={20} weight="fill" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">{t('title')}</DialogTitle>
          </div>
          <p className="text-xs text-slate-500 ml-12">{t('subtitle')}</p>
        </DialogHeader>

        {/* Form body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
               <CircleNotchIcon className="animate-spin text-[#1392ec]" size={32} />
            </div>
          ) : (
            <form id="edit-patient-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Basic Info */}
              <section>
                <h4 className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
                  <span className="flex items-center justify-center size-5 rounded-full bg-[#1392ec]/10 text-[#1392ec] text-xs">1</span>
                  {t('sectionBasic')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('fullName')}</label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                      placeholder={t('fullNamePlaceholder')}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('dob')}</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('gender')}</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                    >
                      <option value="">{t('genderPlaceholder')}</option>
                      <option value="MALE">{t('table.genders.MALE')}</option>
                      <option value="FEMALE">{t('table.genders.FEMALE')}</option>
                      <option value="OTHER">{t('table.genders.OTHER')}</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('phone')}</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                      placeholder={t('phonePlaceholder')}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('email')}</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white cursor-not-allowed opacity-75"
                      placeholder={t('emailPlaceholder')}
                      readOnly
                    />
                  </div>
                  <div className="form-group md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('address')}</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                      placeholder={t('addressPlaceholder')}
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Section 2: Medical Info */}
              <section>
                <h4 className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
                  <span className="flex items-center justify-center size-5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs">2</span>
                  {t('sectionMedical')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group md:col-span-2 md:w-1/2 md:pr-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('bloodType')}</label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                    >
                      <option value="">{t('bloodTypePlaceholder')}</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="unknown">{t('unknown')}</option>
                    </select>
                  </div>
                  
                  <div className="form-group md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('allergies')}</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {allergies.map((allergy, i) => (
                          <span key={i} className="flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-lg text-xs font-semibold">
                            {allergy}
                            <TrashIcon 
                              className="cursor-pointer hover:text-red-800"
                              onClick={() => setAllergies(prev => prev.filter((_, idx) => idx !== i))}
                            />
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={allergyInput}
                          onChange={e => setAllergyInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddAllergy();
                            }
                          }}
                          className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                          placeholder={t('addAllergy')}
                        />
                        <button
                          type="button"
                          onClick={handleAddAllergy}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                        >
                           <PlusIcon size={14} weight="bold" /> {t('addAllergy').replace('+', '')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('chronicConditions')}</label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {chronicConditions.map((cond, i) => (
                          <span key={i} className="flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 px-2 py-1 rounded-lg text-xs font-semibold">
                            {cond}
                            <TrashIcon 
                              className="cursor-pointer hover:text-amber-800"
                              onClick={() => setChronicConditions(prev => prev.filter((_, idx) => idx !== i))}
                            />
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={conditionInput}
                          onChange={e => setConditionInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCondition();
                            }
                          }}
                          className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                          placeholder={t('addCondition')}
                        />
                        <button
                          type="button"
                          onClick={handleAddCondition}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer flex items-center gap-1"
                        >
                          <PlusIcon size={14} weight="bold" /> {t('addCondition').replace('+', '')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('medicalNotes')}</label>
                    <textarea
                      name="medicalNotes"
                      value={formData.medicalNotes}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white min-h-[80px]"
                      placeholder={t('medicalNotesPlaceholder')}
                    />
                  </div>
                </div>
              </section>

              <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />

              {/* Section 3: Insurance */}
              <section>
                <h4 className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-4 uppercase tracking-wider">
                  <span className="flex items-center justify-center size-5 rounded-full bg-purple-500/10 text-purple-600 text-xs">3</span>
                  {t('sectionInsurance')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('insuranceType')}</label>
                    <select
                      name="insuranceProvider"
                      value={formData.insuranceProvider}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                    >
                      <option value="">{t('insuranceTypePlaceholder')}</option>
                      <option value="BHYT">{t('form.insuranceProviderPlaceholder')?.split(',')[0] || 'BHYT'}</option>
                      <option value="Private">{t('form.insuranceProviderPlaceholder')?.split(',')[1] || 'Private'}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('insuranceNumber')}</label>
                    <input
                      name="insuranceNumber"
                      value={formData.insuranceNumber}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white"
                      placeholder={t('insuranceNumberPlaceholder')}
                    />
                  </div>
                  <div className="form-group md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{t('insuranceExpiry')}</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formData.insuranceExpiry}
                      onChange={handleChange}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-[#1392ec] outline-none transition-all dark:text-white max-w-[50%]"
                    />
                  </div>
                </div>
              </section>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer border border-[#e5e7eb]"
            disabled={isLoading}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 text-sm font-bold text-white bg-[#1392ec] hover:bg-[#1180d0] rounded-xl transition shadow flex items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <CircleNotchIcon className="animate-spin" size={16} />
                {t('saving')}
              </>
            ) : (
              t('save')
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
