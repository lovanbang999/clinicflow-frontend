'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useApiData } from '@/lib/hooks/core/useApiData';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import { format, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { StethoscopeIcon } from '@phosphor-icons/react';
import { 
  ChevronDown, Stethoscope, Image as ImageIcon, ChevronLeft, ChevronRight, 
  Search, FileText, Activity, Download, Heart, Thermometer, Wind, AlertCircle
} from 'lucide-react';

export interface PatientHistoryItem {
  id: string;
  createdAt: string;
  visitStep: string;
  diagnosisName?: string;
  diagnosisCode?: string;
  treatmentPlan?: string;
  chiefComplaint?: string;
  heartRate?: string;
  bloodPressure?: string;
  temperature?: string;
  spO2?: string;
  doctorNotes?: string;
  booking?: {
    status?: string;
    bookingDate?: string;
    service?: { name: string };
    doctor?: { fullName: string };
  };
  prescription?: {
    notes?: string;
    items?: { 
      medicineName: string; 
      dosage: string; 
      frequency: string; 
      quantity: number; 
      unit: string; 
      durationDays?: number;
      instructions?: string;
    }[];
  };
  visitServiceOrders?: { 
    id: string; 
    status: string; 
    resultText?: string; 
    resultFileUrl?: string; 
    isAbnormal?: boolean; 
    service?: { name: string } 
  }[];
  labOrders?: {
    id: string;
    status: string;
    testName: string;
    result?: {
      id: string;
      resultText?: string;
      resultFileUrl?: string;
      isAbnormal?: boolean;
      abnormalNote?: string;
      resultDate?: string;
    };
    service: { id: string; name: string };
  }[];
}

type FilterStatus = 'ALL' | 'COMPLETED' | 'PENDING' | 'CANCELLED';

const FilterChip = ({ label, value, activeFilter, setActiveFilter }: { label: string; value: FilterStatus; activeFilter: FilterStatus; setActiveFilter: (v: FilterStatus) => void }) => (
  <button
    onClick={() => setActiveFilter(value)}
    className={`whitespace-nowrap rounded-full px-4 py-1.5 md:px-5 md:py-2 text-[11px] md:text-[13px] font-semibold border transition-all duration-200 active:scale-95 cursor-pointer ${
      activeFilter === value
        ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-600/10'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
    }`}
  >
    {label}
  </button>
);

const VisitCard = ({ 
  visit, 
  isExpanded, 
  onToggle,
  tEmr,
  formatDateTime
}: { 
  visit: PatientHistoryItem; 
  isExpanded: boolean; 
  onToggle: () => void;
  tEmr: ReturnType<typeof useTranslations>;
  formatDateTime: (d: string) => string;
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'labs' | 'prescription'>('summary');
  
  const isCancelled = visit.booking?.status === 'CANCELLED';
  const isCompleted = visit.visitStep === 'COMPLETED' || visit.booking?.status === 'COMPLETED';

  // Render Vitals grid
  const hasVitals = visit.heartRate || visit.bloodPressure || visit.temperature || visit.spO2;

  // Extract labOrders or visitServiceOrders to present uniform list of tests
  const displayLabs = useMemo(() => {
    // If we have visit.labOrders, let's map them
    if (visit.labOrders && visit.labOrders.length > 0) {
      return visit.labOrders.map(o => ({
        id: o.id,
        testName: o.testName || o.service?.name,
        status: o.status,
        resultText: o.result?.resultText,
        resultFileUrl: o.result?.resultFileUrl,
        isAbnormal: o.result?.isAbnormal === true,
        abnormalNote: o.result?.abnormalNote
      }));
    }
    // Fallback to visitServiceOrders if only those are populated
    if (visit.visitServiceOrders && visit.visitServiceOrders.length > 0) {
      return visit.visitServiceOrders.map(o => ({
        id: o.id,
        testName: o.service?.name || 'Xét nghiệm / Thăm khám',
        status: o.status,
        resultText: o.resultText,
        resultFileUrl: o.resultFileUrl,
        isAbnormal: o.isAbnormal === true,
        abnormalNote: undefined
      }));
    }
    return [];
  }, [visit.labOrders, visit.visitServiceOrders]);

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-2xl mb-3 overflow-hidden transition-all duration-350 ${
      isExpanded 
        ? 'border-blue-400 dark:border-blue-500/50 shadow-md ring-1 ring-blue-400/20' 
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm'
    }`}>
      {/* Card Header */}
      <div 
        className="p-4 md:p-5 flex items-center gap-3 md:gap-4 select-none cursor-pointer"
        onClick={onToggle}
      >
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isCancelled 
            ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' 
            : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
        }`}>
          <Stethoscope className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] md:text-base font-bold text-slate-850 dark:text-white leading-tight mb-1 truncate">
            {visit.booking?.service?.name || tEmr('history.generalVisit')}
          </div>
          <div className="text-[11px] md:text-sm text-slate-500 truncate flex items-center gap-2">
            <span>{formatDateTime(visit.createdAt)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">BS. {visit.booking?.doctor?.fullName || '—'}</span>
          </div>
        </div>
        
        {isCancelled ? (
          <div className="rounded-full px-2.5 py-1 text-[10px] md:text-xs font-bold shrink-0 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-100 dark:border-red-900/20">
            Đã huỷ
          </div>
        ) : isCompleted ? (
          <div className="rounded-full px-2.5 py-1 text-[10px] md:text-xs font-bold shrink-0 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/20">
            Hoàn tất
          </div>
        ) : (
          <div className="rounded-full px-2.5 py-1 text-[10px] md:text-xs font-bold shrink-0 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20">
            Đang xử lý
          </div>
        )}
        
        <ChevronDown className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-transform text-slate-400 duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
      </div>

      {/* Expanded Content with beautiful Tabs */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 p-4 md:p-6 space-y-5">
          {/* Tabs Menu */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-2.5 text-xs md:text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
                activeTab === 'summary' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('labs')}
              className={`pb-2.5 text-xs md:text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
                activeTab === 'labs' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Kết quả XN & CĐHA
              {displayLabs.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  {displayLabs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('prescription')}
              className={`pb-2.5 text-xs md:text-sm font-bold border-b-2 transition-all relative cursor-pointer ${
                activeTab === 'prescription' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Đơn thuốc
              {visit.prescription?.items && visit.prescription.items.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {visit.prescription.items.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Vitals */}
              {hasVitals && (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                  <h4 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Chỉ số sinh hiệu</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {visit.bloodPressure && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 shrink-0">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 leading-none">Huyết áp</p>
                          <p className="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mt-1">{visit.bloodPressure} mmHg</p>
                        </div>
                      </div>
                    )}
                    {visit.heartRate && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 shrink-0">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 leading-none">Nhịp tim</p>
                          <p className="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mt-1">{visit.heartRate} bpm</p>
                        </div>
                      </div>
                    )}
                    {visit.temperature && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center text-amber-500 shrink-0">
                          <Thermometer className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 leading-none">Nhiệt độ</p>
                          <p className="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mt-1">{visit.temperature} °C</p>
                        </div>
                      </div>
                    )}
                    {visit.spO2 && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center text-blue-500 shrink-0">
                          <Wind className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 leading-none">SpO2</p>
                          <p className="text-[12px] md:text-[13px] font-bold text-slate-700 dark:text-slate-300 mt-1">{visit.spO2} %</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Diagnosis & Findings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chief complaint & clinical findings */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <div>
                    <h4 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lý do khám chính</h4>
                    <p className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{visit.chiefComplaint || 'Không có ghi nhận'}</p>
                  </div>
                  {visit.doctorNotes && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ghi chú lâm sàng</h4>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{visit.doctorNotes}</p>
                    </div>
                  )}
                </div>

                {/* ICD-10 & Treatment Plan */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                  <div>
                    <h4 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chẩn đoán</h4>
                    {visit.diagnosisName ? (
                      <div className="mt-1.5 flex items-start gap-2">
                        {visit.diagnosisCode && (
                          <span className="inline-block shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 mt-0.5">
                            {visit.diagnosisCode}
                          </span>
                        )}
                        <p className="text-xs md:text-sm font-bold text-slate-800 dark:text-white leading-relaxed">{visit.diagnosisName}</p>
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm text-slate-500 italic mt-1">{tEmr('history.timeline.noDiagnosis')}</p>
                    )}
                  </div>
                  {visit.treatmentPlan && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hướng điều trị</h4>
                      <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{visit.treatmentPlan}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Lab Results (UC-P09) */}
          {activeTab === 'labs' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {(displayLabs.length === 0) ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-450 dark:text-slate-550">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                  <p className="text-xs md:text-sm font-medium">Không có chỉ định xét nghiệm & cận lâm sàng trong ca khám này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayLabs.map(order => {
                    const isOrderCompleted = order.status === 'COMPLETED';
                    const hasResult = !!order.resultText || !!order.resultFileUrl;
                    const isAbnormal = order.isAbnormal === true;
                    
                    return (
                      <div 
                        key={order.id} 
                        className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isAbnormal 
                            ? 'border-red-200 dark:border-red-950 bg-red-500/[0.02] dark:bg-red-900/[0.02]' 
                            : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-white">{order.testName}</span>
                            {isAbnormal && (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-750 dark:bg-red-900/40 dark:text-red-400 animate-pulse">
                                <AlertCircle className="w-3 h-3" />
                                Bất thường
                              </span>
                            )}
                          </div>
                          
                          {/* Measurements or indices */}
                          {hasResult && order.resultText ? (
                            <div className={`p-3 rounded-xl text-xs md:text-[13px] font-medium leading-relaxed whitespace-pre-line ${
                              isAbnormal 
                                ? 'bg-red-500/5 text-red-650 dark:text-red-400 border border-red-500/10' 
                                : 'bg-slate-50 dark:bg-slate-955 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-900'
                            }`}>
                              <span className="font-bold text-[9px] md:text-[10px] uppercase text-slate-400 block mb-1.5">Kết quả đo lường:</span>
                              {order.resultText}
                              {order.abnormalNote && (
                                <p className="mt-2 text-[10px] md:text-xs font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                                  ⚠️ Ghi chú bất thường: {order.abnormalNote}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 italic">
                              Chưa có nội dung mô tả chi tiết kết quả.
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>Mã chỉ định: #{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className="w-0.5 h-2 bg-slate-200 dark:bg-slate-800"></span>
                            <span>Trạng thái: 
                              <span className={`ml-1 font-bold ${isOrderCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {isOrderCompleted ? 'Hoàn thành' : 'Đang chờ thực hiện'}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        {isOrderCompleted && order.resultFileUrl && (
                          <a 
                            href={order.resultFileUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] md:text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40 active:scale-95 transition-all shrink-0 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tải file kết quả PDF
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Prescription (UC-P09) */}
          {activeTab === 'prescription' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {(!visit.prescription?.items || visit.prescription.items.length === 0) ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-450 dark:text-slate-550">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-350" />
                  <p className="text-xs md:text-sm font-medium">Bác sĩ không kê đơn thuốc trong ca khám này</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visit.prescription.notes && (
                    <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3 text-xs md:text-[13px] text-amber-700 dark:text-amber-400 font-medium flex items-start gap-1.5">
                      <span className="shrink-0 text-base leading-none">💡</span>
                      <div>
                        <span className="font-bold">Lời dặn bác sĩ:</span> {visit.prescription.notes}
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-400 font-bold">
                            <th className="p-3 md:p-4">Tên thuốc</th>
                            <th className="p-3 md:p-4">Liều lượng & Tần suất</th>
                            <th className="p-3 md:p-4 text-center">Số ngày</th>
                            <th className="p-3 md:p-4 text-right">Số lượng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visit.prescription.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/30 dark:hover:bg-slate-850/30 transition-colors">
                              <td className="p-3 md:p-4">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{item.medicineName}</p>
                                {item.instructions && (
                                  <p className="text-[10px] md:text-xs text-slate-400 mt-1 italic">Cách dùng: {item.instructions}</p>
                                )}
                              </td>
                              <td className="p-3 md:p-4 text-slate-600 dark:text-slate-400">
                                <span className="font-semibold">{item.dosage}</span> · <span>{item.frequency}</span>
                              </td>
                              <td className="p-3 md:p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                                {item.durationDays ? `${item.durationDays} ngày` : '—'}
                              </td>
                              <td className="p-3 md:p-4 text-right font-black text-slate-800 dark:text-white">
                                {item.quantity} {item.unit || 'viên'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function PatientMedicalHistoryPage() {
  const t = useTranslations('patientOverview.medicalHistory');
  const tGreeting = useTranslations('booking');
  const tEmr = useTranslations('emr');
  const locale = useLocale();

  const hour = new Date().getHours();
  let greetingKey = 'pageGreetingMorning';
  if (hour >= 12 && hour < 18) greetingKey = 'pageGreetingAfternoon';
  else if (hour >= 18 || hour < 5) greetingKey = 'pageGreetingEvening';
  
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  const { data, isLoading } = useApiData(
    () => medicalRecordsApi.getMyVisits(currentPage, 10),
    null,
    [currentPage]
  );

  const rawVisits = useMemo(() => data?.items || [], [data?.items]);
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const hasInitialized = useRef(false);

  // Auto-expand the first visit item only once when loaded
  useEffect(() => {
    if (rawVisits.length > 0 && !hasInitialized.current) {
      const timer = setTimeout(() => {
        setExpandedVisitId(rawVisits[0].id);
      }, 0);
      hasInitialized.current = true;
      return () => clearTimeout(timer);
    }
  }, [rawVisits]);

  // Handle local searching across fetched items (or status checks)
  const filteredVisits = useMemo(() => {
    return rawVisits.filter((v: PatientHistoryItem) => {
      // 1. Status Filter
      const bookingStatus = v.booking?.status || 'COMPLETED';
      let statusMatches = true;
      if (activeFilter === 'COMPLETED') statusMatches = bookingStatus === 'COMPLETED' || v.visitStep === 'COMPLETED';
      else if (activeFilter === 'CANCELLED') statusMatches = bookingStatus === 'CANCELLED';
      else if (activeFilter === 'PENDING') statusMatches = !['COMPLETED', 'CANCELLED'].includes(bookingStatus) && v.visitStep !== 'COMPLETED';

      if (!statusMatches) return false;

      // 2. Search Box Filter (Search doctor name, service name or diagnosis)
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const serviceName = (v.booking?.service?.name || '').toLowerCase();
      const doctorName = (v.booking?.doctor?.fullName || '').toLowerCase();
      const diagnosis = (v.diagnosisName || '').toLowerCase();

      return serviceName.includes(query) || doctorName.includes(query) || diagnosis.includes(query);
    });
  }, [rawVisits, activeFilter, searchTerm]);

  // Group visits by month for a high-end timeline layout
  const groupedVisits = useMemo(() => {
    const groups: Record<string, PatientHistoryItem[]> = {};
    filteredVisits.forEach((v: PatientHistoryItem) => {
      const d = new Date(v.createdAt);
      if (!isValid(d)) return;
      const monthKey = locale === 'vi' 
        ? `Tháng ${format(d, 'M')} · ${format(d, 'yyyy')}`
        : format(d, 'MMMM yyyy');
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(v);
    });
    return groups;
  }, [filteredVisits, locale]);

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (!isValid(d)) return '—';
    return format(d, 'dd/MM/yyyy · HH:mm', { locale: locale === 'vi' ? vi : undefined });
  };

  return (
    <div className="max-w-3xl mx-auto p-2 space-y-6">
      <div className="space-y-1">
        <p className="text-xs sm:text-sm text-[#1392ec] font-bold uppercase tracking-wider">{tGreeting(greetingKey)}</p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{t('title')}</h1>
        <p className="text-[13px] text-slate-500 font-medium">
          {total > 0
            ? t('subtitle', { count: total })
            : t('noHistory')}
        </p>
      </div>

      {/* Control panel: Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bác sĩ, chuyên khoa, chẩn đoán..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>

        {/* Status Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide shrink-0">
          <FilterChip label="Tất cả" value="ALL" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterChip label="Hoàn thành" value="COMPLETED" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterChip label="Đang chờ" value="PENDING" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <FilterChip label="Đã huỷ" value="CANCELLED" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : rawVisits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <StethoscopeIcon size={32} className="text-slate-350 dark:text-slate-550" weight="bold" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {t('emptyTitle')}
          </h3>
          <p className="text-sm text-slate-400 max-w-[260px] leading-relaxed mx-auto">
            {t('emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="-mx-4 sm:mx-0">
          <div className="px-4 sm:px-0 pt-2 pb-6 space-y-6">
            {Object.keys(groupedVisits).map((monthKey) => (
              <div key={monthKey}>
                <div className="text-[11px] text-slate-400 font-bold mb-3.5 uppercase tracking-wider pl-0.5">
                  {monthKey}
                </div>
                
                {groupedVisits[monthKey].map(visit => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    isExpanded={expandedVisitId === visit.id}
                    onToggle={() => setExpandedVisitId(expandedVisitId === visit.id ? null : visit.id)}
                    tEmr={tEmr}
                    formatDateTime={formatDateTime}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Premium Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 mt-6 px-4 sm:px-0">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const p = idx + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                        currentPage === p
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/10'
                          : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
