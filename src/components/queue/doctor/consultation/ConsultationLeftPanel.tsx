'use client';

import type { QueueRecord } from '@/lib/api/appointment/queue';
import { useTranslations } from 'next-intl';

interface ConsultationLeftPanelProps {
  item: QueueRecord;
}

import { useConsultation } from './ConsultationContext';

export function ConsultationLeftPanel({ item: propItem }: ConsultationLeftPanelProps) {
  const t = useTranslations('emr.visit');
  const { item: contextItem } = useConsultation();
  const item = propItem || contextItem;
  const patient = item.booking.patientProfile;
  
  if (!patient) return null;

  const allergies = patient.allergies ? patient.allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
  const chronicConditions = patient.chronicConditions ? patient.chronicConditions.split(',').map(a => a.trim()).filter(Boolean) : [];

  const consultationInvoice = item.booking.invoices?.find(inv => inv.invoiceType === 'CONSULTATION');
  const actualFee = consultationInvoice ? Number(consultationInvoice.totalAmount) : 0;

  return (
    <div className="bg-white border-r border-gray-200 overflow-y-auto p-4 flex flex-col gap-4">
      <PatientHeader 
        fullName={patient.fullName} 
        queuePosition={item.queuePosition} 
        gender={patient.gender} 
        dateOfBirth={patient.dateOfBirth} 
        isPreBooked={item.booking.isPreBooked} 
      />

      <div className="-mt-2 mb-1">
        <InfoRow label={t('leftPanel.patientCode')} value={patient.patientCode} />
        <InfoRow label={t('leftPanel.phone')} value={patient.phone} />
        <InfoRow label={t('leftPanel.bookingCode')} value={item.booking.bookingCode} isBadge />
      </div>

      <Separator />

      <ClinicalAlert label={t('leftPanel.clinicalWarning')} title={t('leftPanel.allergyTitle')} items={allergies} emptyLabel={t('leftPanel.noAllergies')} isWarning />

      <Separator />

      <ClinicalAlert label={t('leftPanel.chronicConditions')} items={chronicConditions} emptyLabel={t('leftPanel.none')} />

      <Separator />

      <VisitHistory label={t('leftPanel.visitHistory')} emptyLabel={t('leftPanel.historyWip')} />

      <Separator />

      <FeeStatus label={t('leftPanel.feeStatus')} doctorName={item.booking.doctor?.fullName} fee={actualFee} />
    </div>
  );
}

interface PatientHeaderProps {
  fullName?: string | null;
  queuePosition?: number | null;
  gender?: string | null;
  dateOfBirth?: string | Date | null;
  isPreBooked?: boolean;
}

function PatientHeader({ fullName, queuePosition, gender, dateOfBirth, isPreBooked }: PatientHeaderProps) {
  const t = useTranslations('emr.visit');
  const age = dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : '?';
  const genderLabel = gender === 'MALE' ? t('patientBanner.male') : gender === 'FEMALE' ? t('patientBanner.female') : t('patientBanner.other');
  const bookingType = isPreBooked ? t('leftPanel.bookingPre') : t('leftPanel.bookingWalkin');

  return (
    <div className="flex items-center gap-3 mb-1 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
      <div className="w-[42px] h-[42px] rounded-full bg-blue-50 flex items-center justify-center text-[16px] font-semibold text-blue-700 border border-blue-100 shrink-0">
        {fullName?.split(' ').pop()?.charAt(0) || 'BN'}
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-[15px] text-slate-800 leading-tight">
            {fullName || t('leftPanel.unknownPatient')}
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-teal-50 text-teal-600 border border-teal-100 shrink-0">
            {t('leftPanel.queueStt', { position: queuePosition ?? 0 })}
          </span>
        </div>
        <div className="text-[12px] text-slate-500 leading-tight mt-1.5 truncate">
           {genderLabel} · {age} {t('patientInfo.yearsOld')} · {bookingType}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, isBadge }: { label: string; value?: string | null; isBadge?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
      <span className="text-slate-500 text-[12px]">{label}</span>
      {isBadge ? (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 text-right">
          {value}
        </span>
      ) : (
        <span className="text-slate-900 text-[12px] font-medium text-right">{value || '—'}</span>
      )}
    </div>
  );
}

function ClinicalAlert({ label, title, items, emptyLabel, isWarning }: { label: string; title?: string; items: string[]; emptyLabel: string; isWarning?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">{label}</div>
      {items.length > 0 ? (
        isWarning ? (
          <div className="bg-red-50 border border-[#F7C1C1] rounded p-2.5 text-[12px] text-red-700">
            {title && <div className="font-medium mb-0.5">{title}</div>}
            {items.join(', ')}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {items.map((item, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 border border-slate-200 bg-slate-50 text-slate-700 rounded">
                {item}
              </span>
            ))}
          </div>
        )
      ) : (
        <div className="text-slate-400 text-[12px] italic">{emptyLabel}</div>
      )}
    </div>
  );
}

function VisitHistory({ label, emptyLabel }: { label: string; emptyLabel: string }) {
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">{label}</div>
      <div className="text-slate-400 text-[12px] italic">{emptyLabel}</div>
    </div>
  );
}

function FeeStatus({ label, doctorName, fee }: { label: string; doctorName?: string; fee: number }) {
  const t = useTranslations('emr.visit');
  return (
    <div>
      <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-2">{label}</div>
      <div className="flex justify-between items-center p-2.5 bg-blue-50 border border-blue-100 rounded">
        <span className="text-[12px] text-blue-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">
          {doctorName}
        </span>
        <span className="text-[11px] text-green-700 bg-green-50 border border-[#C0DD97] rounded-full px-2 py-0.5 whitespace-nowrap shrink-0">
          {fee > 0 ? `${fee.toLocaleString('vi-VN')} đ` : t('leftPanel.feeFree')}
        </span>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-[1px] bg-gray-200"></div>;
}
