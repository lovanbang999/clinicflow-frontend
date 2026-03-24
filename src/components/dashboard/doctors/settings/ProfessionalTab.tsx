'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ALL_SPECIALTIES } from '@/components/dashboard/doctors/types';
import { FloppyDiskIcon, XIcon, PlusIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

interface ProfessionalTabProps {
  specialties: string[];
  toggleSpecialty: (sp: string) => void;
  yearsOfExperience: string;
  setYearsOfExperience: (val: string) => void;
  qualifications: string[];
  removeQualification: (idx: number) => void;
  newQual: string;
  setNewQual: (val: string) => void;
  addQualification: () => void;
  bio: string;
  setBio: (val: string) => void;
  onSave: () => void;
  saveProfileLoading: boolean;
}

export function ProfessionalTab({
  specialties,
  toggleSpecialty,
  yearsOfExperience,
  setYearsOfExperience,
  qualifications,
  removeQualification,
  newQual,
  setNewQual,
  addQualification,
  bio,
  setBio,
  onSave,
  saveProfileLoading,
}: ProfessionalTabProps) {
  const t = useTranslations('dashboard.doctorSettings.professional');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{t('title')}</h2>

      {/* Specialties */}
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-2 block">{t('specialties')}</label>
        <div className="flex flex-wrap gap-2">
          {ALL_SPECIALTIES.map((sp) => (
            <button
              key={sp}
              type="button"
              onClick={() => toggleSpecialty(sp)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                specialties.includes(sp)
                  ? 'bg-[#1392ec] text-white border-[#1392ec]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-[#1392ec] hover:text-[#1392ec]'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      {/* Years of Experience */}
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('experience')}</label>
        <Input
          type="number"
          min={0}
          max={60}
          value={yearsOfExperience}
          onChange={(e) => setYearsOfExperience(e.target.value)}
          placeholder={t('experiencePlaceholder')}
          className="h-10 rounded-xl w-40"
        />
      </div>

      {/* Qualifications */}
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-2 block">{t('qualifications')}</label>
        <div className="space-y-2 mb-3">
          {qualifications.map((q, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2">
              <span className="text-sm text-slate-700 flex-1">{q}</span>
              <button onClick={() => removeQualification(idx)} className="text-slate-400 hover:text-red-500 cursor-pointer">
                <XIcon size={14} weight="bold" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newQual}
            onChange={(e) => setNewQual(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addQualification()}
            placeholder={t('qualificationsPlaceholder')}
            className="h-9 rounded-xl text-sm flex-1"
          />
          <Button
            size="sm"
            onClick={addQualification}
            className="h-9 bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer gap-1"
          >
            <PlusIcon size={14} weight="bold" />
            {t('addQualification')}
          </Button>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{t('bio')}</label>
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t('bioPlaceholder')}
          className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#1392ec] focus:ring-2 focus:ring-[#1392ec]/20 transition"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={saveProfileLoading}
          className="bg-[#1392ec] hover:bg-[#1180d0] text-white cursor-pointer gap-2 rounded-xl"
        >
          <FloppyDiskIcon size={16} weight="bold" />
          {saveProfileLoading ? t('saving') : t('saveBtn')}
        </Button>
      </div>
    </div>
  );
}
