'use client';

import { useState, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { useTranslations } from 'next-intl';
import { useConsultation } from './ConsultationContext';
import { medicalRecordsApi, type VisitHistoryItem } from '@/lib/api/clinical/medical-records';

interface ConsultationLeftPanelProps {
  item: QueueRecord;
}

export function ConsultationLeftPanel({ item: propItem }: ConsultationLeftPanelProps) {
  const t = useTranslations('emr.visit');
  const { item: contextItem } = useConsultation();
  const item = propItem || contextItem;
  const patient = item.booking.patientProfile;

  const [history, setHistory] = useState<VisitHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(!!patient?.id);

  useEffect(() => {
    if (!patient?.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingHistory(true);
    medicalRecordsApi.getPatientHistory(patient.id, 1, 5)
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          setHistory(data.items);
        }
      })
      .catch((err) => console.error('Failed to load patient history', err))
      .finally(() => setLoadingHistory(false));
  }, [patient?.id]);
  
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
        bloodType={patient.bloodType}
        heightCm={patient.heightCm}
        weightKg={patient.weightKg}
      />

      <div className="-mt-2 mb-1">
        <InfoRow label={t('leftPanel.patientCode')} value={patient.patientCode} />
        <InfoRow label={t('leftPanel.phone')} value={patient.phone} />
        <InfoRow label={t('leftPanel.bookingCode')} value={item.booking.bookingCode} isBadge />
      </div>

      <Separator />

      <ClinicalAlert 
        label={t('leftPanel.clinicalWarning')} 
        title={t('leftPanel.allergyTitle')} 
        items={allergies} 
        emptyLabel={t('leftPanel.noAllergies')} 
        isWarning 
      />

      <Separator />

      <ClinicalAlert label={t('leftPanel.chronicConditions')} items={chronicConditions} emptyLabel={t('leftPanel.none')} />

      <Separator />

      <PastVisitsTimeline 
        label={t('leftPanel.visitHistory')} 
        items={history}
        loading={loadingHistory}
        emptyLabel={t('leftPanel.noHistory') || 'Chưa có lịch sử khám tại đây'} 
      />

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
  bloodType?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
}

function PatientHeader({ 
  fullName, 
  queuePosition, 
  gender, 
  dateOfBirth, 
  isPreBooked,
  bloodType,
  heightCm,
  weightKg
}: PatientHeaderProps) {
  const t = useTranslations('emr.visit');
  const age = dateOfBirth ? new Date().getFullYear() - new Date(dateOfBirth).getFullYear() : '?';
  const genderLabel = gender === 'MALE' ? t('patientBanner.male') : gender === 'FEMALE' ? t('patientBanner.female') : t('patientBanner.other');
  const bookingType = isPreBooked ? t('leftPanel.bookingPre') : t('leftPanel.bookingWalkin');

  return (
    <div className="flex flex-col gap-2 mb-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
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

      {/* Blood type, Height, Weight row */}
      {(bloodType || heightCm || weightKg) && (
        <div className="flex items-center gap-1.5 mt-1.5 pt-2 border-t border-slate-100/80 text-[10px] text-slate-600 flex-wrap">
          {bloodType && (
            <span className="bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded font-bold">
              {t('leftPanel.bloodType') || 'Nhóm máu'}: {bloodType}
            </span>
          )}
          {heightCm && (
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
              {t('leftPanel.height') || 'Chiều cao'}: {Number(heightCm)} cm
            </span>
          )}
          {weightKg && (
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
              {t('leftPanel.weight') || 'Cân nặng'}: {Number(weightKg)} kg
            </span>
          )}
        </div>
      )}
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

function ClinicalAlert({ 
  label, 
  title, 
  items, 
  emptyLabel, 
  isWarning 
}: { 
  label: string; 
  title?: string; 
  items: string[]; 
  emptyLabel: string; 
  isWarning?: boolean; 
}) {
  return (
    <div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</div>
      {items.length > 0 ? (
        isWarning ? (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 text-[12px] text-red-700 flex items-start gap-2 shadow-sm animate-pulse">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div className="min-w-0">
              {title && <div className="font-extrabold text-[12px] uppercase tracking-wide text-red-800 mb-0.5">{title}</div>}
              <div className="font-semibold break-words">{items.join(', ')}</div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {items.map((item, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 border border-slate-200 bg-slate-50 text-slate-700 font-medium rounded-lg shadow-sm">
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

function PastVisitsTimeline({ 
  label, 
  items, 
  loading, 
  emptyLabel 
}: { 
  label: string; 
  items: VisitHistoryItem[]; 
  loading: boolean; 
  emptyLabel: string; 
}) {
  const t = useTranslations('emr.visit');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</div>
        <div className="text-slate-400 text-[12px] italic animate-pulse">{t('leftPanel.historyWip') || 'Đang tải dữ liệu...'}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</div>
        <div className="text-slate-400 text-[12px] italic">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">
        {label} ({items.length})
      </div>
      <div className="flex flex-col gap-2">
        {items.map((record, index) => {
          const isExpanded = expandedIndex === index;
          const dateStr = new Date(record.createdAt).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
          const doctorName = record.booking?.doctor?.fullName || 'Bác sĩ';
          const diagnosis = record.diagnosisName || record.diagnosisCode || t('timeline.noDiagnosis') || 'Chưa có chẩn đoán';
          const serviceName = record.booking?.service?.name || t('generalExam') || 'Khám tổng quát';

          return (
            <div 
              key={record.id} 
              className={`border border-slate-100 rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'bg-slate-50/50 shadow-sm border-slate-200' : 'bg-white hover:border-slate-200'}`}
            >
              {/* Accordion Trigger Header */}
              <button
                type="button"
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full text-left p-2.5 flex items-center justify-between text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer"
              >
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-800 text-[12px]">{dateStr}</span>
                  <span className="text-[10px] text-slate-500 truncate mt-0.5">{serviceName}</span>
                </div>
                <span className="text-slate-400 text-[11px] shrink-0 font-semibold select-none ml-2">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Accordion Expandable Content */}
              {isExpanded && (
                <div className="px-2.5 pb-2.5 pt-0.5 border-t border-slate-100/50 text-[11px] text-slate-600 space-y-1.5 animate-in slide-in-from-top-1 duration-150">
                  <div>
                    <span className="font-bold text-slate-700">{t('timeline.doctor') || 'Bác sĩ'}:</span>{' '}
                    <span>{doctorName}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">{t('timeline.diagnosis') || 'Chẩn đoán'}:</span>{' '}
                    <span className="italic">{"\""}{diagnosis}{"\""}</span>
                  </div>
                  
                  {/* Vitals inside Past Visit */}
                  {(record.bloodPressure || record.heartRate || record.temperature) && (
                    <div className="pt-1.5 border-t border-slate-100/50 mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-[10px]">
                      {record.bloodPressure && (
                        <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                          HA: {record.bloodPressure} mmHg
                        </span>
                      )}
                      {record.heartRate && (
                        <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                          Mạch: {record.heartRate} bpm
                        </span>
                      )}
                      {record.temperature && (
                        <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                          Nhiệt độ: {record.temperature}°C
                        </span>
                      )}
                    </div>
                  )}

                  {/* Prescription inside Past Visit */}
                  {record.prescription?.items && record.prescription.items.length > 0 && (
                    <div className="pt-1.5 border-t border-slate-100/50 mt-1.5">
                      <span className="font-bold text-slate-700 block mb-0.5">
                        {t('timeline.prescription') || 'Đơn thuốc'}:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px] pl-1">
                        {record.prescription.items.map((rxItem) => (
                          <li key={rxItem.id} className="truncate">
                            <span className="font-medium text-slate-800">{rxItem.medicineName}</span>{' '}
                            <span className="text-slate-400">({rxItem.quantity} viên)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FeeStatus({ label, doctorName, fee }: { label: string; doctorName?: string; fee: number }) {
  const t = useTranslations('emr.visit');
  return (
    <div>
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</div>
      <div className="flex justify-between items-center p-2.5 bg-blue-50 border border-blue-100 rounded-xl">
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
  return <div className="h-[1px] bg-gray-100"></div>;
}
