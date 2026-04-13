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

  const allergies = patient.allergies ? patient.allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
  const chronicConditions = patient.chronicConditions ? patient.chronicConditions.split(',').map(a => a.trim()).filter(Boolean) : [];

  const consultationInvoice = item.booking.invoices?.find(inv => inv.invoiceType === 'CONSULTATION');
  const actualFee = consultationInvoice ? Number(consultationInvoice.totalAmount) : 0;

  return (
    <div className="bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4">
      {/* Patient Profile Header block */}
      <div className="flex items-center gap-3 mb-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
        <div className="w-[42px] h-[42px] rounded-full bg-blue-50 flex items-center justify-center text-[16px] font-semibold text-blue-700 border border-blue-100 shrink-0">
          {patient.fullName?.split(' ').pop()?.charAt(0) || 'BN'}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-[15px] text-slate-800 leading-tight">
              {patient.fullName || 'Unknown Patient'}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
              STT #{item.queuePosition}
            </span>
          </div>
          <div className="text-[12px] text-slate-500 leading-tight mt-1.5 truncate">
             {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'} ·{' '}
             {patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '?'} tuổi ·{' '}
             {item.booking.isPreBooked ? 'Pre-book' : 'Walk-in'}
          </div>
        </div>
      </div>

      {/* Patient Profile Data List */}
      <div className="-mt-2 mb-1">
        <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-b-0">
          <span className="text-slate-500 text-[12px]">{t('leftPanel.patientCode')}</span>
          <span className="text-slate-900 text-[12px] font-medium text-right">{patient.patientCode || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-b-0">
          <span className="text-slate-500 text-[12px]">{t('leftPanel.phone')}</span>
          <span className="text-slate-900 text-[12px] font-medium text-right">{patient.phone || '—'}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
          <span className="text-slate-500 text-[12px]">{t('leftPanel.bookingCode')}</span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 text-right">
             {item.booking.bookingCode}
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
            {item.booking.doctor?.fullName}
          </span>
          <span className="text-[11px] text-green-700 bg-green-50 border border-[#C0DD97] rounded-full px-2 py-0.5 whitespace-nowrap shrink-0">
            {actualFee > 0 
              ? `${actualFee.toLocaleString('vi-VN')} đ` 
              : t('leftPanel.feeFree')}
          </span>
        </div>
      </div>

    </div>
  );
}
