'use client';

import type { QueueRecord } from '@/lib/api/appointment/queue';
import { useTranslations } from 'next-intl';

interface ConsultationLeftPanelProps {
  item: QueueRecord;
}

export function ConsultationLeftPanel({ item }: ConsultationLeftPanelProps) {
  const t = useTranslations('emr.visit');
  const patient = item.booking.patientProfile;
  
  if (!patient) return null;

  const dateOfBirth = patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A';
  
  const allergies = patient.allergies ? patient.allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
  const chronicConditions = patient.chronicConditions ? patient.chronicConditions.split(',').map(a => a.trim()).filter(Boolean) : [];

  return (
    <div className="bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Patient Profile */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
          {t('leftPanel.profile')}
        </div>
        <div className="flex justify-between items-start py-1 border-b border-gray-100 last:border-b-0">
          <span className="text-slate-500 text-[12px]">{t('leftPanel.patientCode')}</span>
          <span className="text-slate-900 text-[12px] font-medium text-right max-w-[55%]">{patient.patientCode || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-start py-1 border-b border-gray-100 last:border-b-0">
          <span className="text-slate-500 text-[12px]">{t('leftPanel.dob')}</span>
          <span className="text-slate-900 text-[12px] font-medium text-right max-w-[55%]">{dateOfBirth}</span>
        </div>
        <div className="flex justify-between items-start py-1 border-b border-gray-100 last:border-b-0">
          <span className="text-slate-500 text-[12px]">{t('leftPanel.gender')}</span>
          <span className="text-slate-900 text-[12px] font-medium text-right max-w-[55%]">
            {patient.gender ? t(`leftPanel.genders.${patient.gender.toLowerCase() as 'male' | 'female' | 'other'}`) : '—'}
          </span>
        </div>
      </div>

      <div className="h-[1px] bg-gray-200"></div>

      {/* Allergies Warning */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
          {t('leftPanel.clinicalWarning')}
        </div>
        {allergies.length > 0 ? (
          <div className="bg-red-50 border border-[#F7C1C1] rounded p-2.5 text-[12px] text-red-700">
            <div className="font-medium mb-0.5">{t('leftPanel.allergyTitle')}</div>
            {allergies.join(', ')}
          </div>
        ) : (
          <div className="text-slate-400 text-[12px] italic">{t('leftPanel.noAllergies')}</div>
        )}
      </div>

      <div className="h-[1px] bg-gray-200"></div>

      {/* Chronic Conditions */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
          {t('leftPanel.chronicConditions')}
        </div>
        {chronicConditions.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {chronicConditions.map((cond, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 border border-slate-200 bg-slate-50 text-slate-700 rounded">
                {cond}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-[12px] italic">{t('leftPanel.none')}</div>
        )}
      </div>

      <div className="h-[1px] bg-gray-200"></div>

      {/* Visit History placeholder */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
          {t('leftPanel.visitHistory')}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="text-slate-400 text-[12px] italic">{t('leftPanel.historyWip')}</div>
        </div>
      </div>

      <div className="h-[1px] bg-gray-200"></div>

      {/* Consultation Fee Status */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">
          {t('leftPanel.feeStatus')}
        </div>
        <div className="flex justify-between items-center p-2.5 bg-blue-50 border border-blue-100 rounded">
          <span className="text-[12px] text-blue-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">
            BS. {item.booking.doctor?.fullName}
          </span>
          <span className="text-[11px] text-green-700 bg-green-50 border border-[#C0DD97] rounded-full px-2 py-0.5 whitespace-nowrap shrink-0">
            {t('leftPanel.feePaid')}
          </span>
        </div>
      </div>

    </div>
  );
}
