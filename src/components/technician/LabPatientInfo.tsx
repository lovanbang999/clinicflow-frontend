'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { UserIcon } from '@phosphor-icons/react';
import type { LabOrder } from '@/lib/api/clinical/lab-orders';

interface LabPatientInfoProps {
  patientProfile: LabOrder['patientProfile'];
  bookingCode?: string;
}

export function LabPatientInfo({ patientProfile, bookingCode }: LabPatientInfoProps) {
  const t = useTranslations('technicianWorklist.result');
  const tCommon = useTranslations('common.profile');

  if (!patientProfile) return null;

  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#e5e7eb] bg-slate-50 flex items-center gap-2">
        <UserIcon size={20} weight="bold" className="text-slate-500" />
        <h3 className="font-semibold text-slate-800">{t('patientInfo')}</h3>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('form.fullNameLabel')}
          </p>
          <p className="font-medium text-slate-900">{patientProfile.fullName}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('form.patientCodeLabel')}
          </p>
          <p className="text-slate-900">{patientProfile.patientCode || bookingCode}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('form.genderLabel')}
            </p>
            <p className="text-slate-900">
              {patientProfile.gender === 'MALE' ? tCommon('male') : patientProfile.gender === 'FEMALE' ? tCommon('female') : tCommon('other')}
            </p>
          </div>
          {patientProfile.dateOfBirth && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {t('form.birthYearLabel')}
              </p>
              <p className="text-slate-900">{format(new Date(patientProfile.dateOfBirth), 'yyyy')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
