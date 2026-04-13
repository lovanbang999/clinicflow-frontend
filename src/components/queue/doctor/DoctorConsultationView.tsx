'use client';

import { useState, useCallback, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { ConsultationLeftPanel } from './consultation/ConsultationLeftPanel';
import { ConsultationCenterTabs } from './consultation/ConsultationCenterTabs';
import { ConsultationRightPanel } from './consultation/ConsultationRightPanel';

interface DoctorConsultationViewProps {
  item: QueueRecord;
  onExit: () => void;
  onSuccess: () => void;
}

export function DoctorConsultationView({ item, onExit, onSuccess }: DoctorConsultationViewProps) {
  const t = useTranslations('emr.visit');
  const [medicalRecord, setMedicalRecord] = useState<VisitResultsResponse | null>(null);

  const fetchRecord = useCallback(() => {
    medicalRecordsApi.getVisitResults(item.bookingId)
      .then(res => setMedicalRecord(res))
      .catch(error => {
        console.error('Failed to fetch medical record:', error);
      });
  }, [item.bookingId]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const handleDataChange = useCallback(() => {
    fetchRecord(); // Refresh data when child components update (like adding a lab order)
  }, [fetchRecord]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f5f5f3] overflow-hidden text-[13px]">
      {/* TOP HEADER */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-3 shrink-0 relative z-10 w-full mb-0 h-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="w-8 h-8 rounded border border-gray-200 text-slate-500 hover:bg-slate-100"
          title={t('shared.back')}
        >
          <ArrowLeftIcon size={14} weight="bold" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-full bg-blue-50 flex items-center justify-center text-[11px] font-medium text-blue-800 border border-blue-100 shrink-0">
            {item.booking.patientProfile?.fullName?.split(' ').pop()?.charAt(0) || 'BN'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-[14px] text-slate-900 leading-tight">
                {item.booking.patientProfile?.fullName || 'Unknown Patient'}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-100">
                {item.booking.bookingCode}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-600 border border-teal-100">
                STT #{item.queuePosition}
              </span>
            </div>
            <div className="text-[12px] text-slate-500 leading-tight mt-0.5">
              {item.booking.patientProfile?.gender === 'MALE' ? 'Nam' : 'Nữ'} ·{' '}
              {item.booking.patientProfile?.dateOfBirth ? new Date().getFullYear() - new Date(item.booking.patientProfile.dateOfBirth).getFullYear() : '?'} tuổi ·{' '}
              {item.booking.patientProfile?.phone} ·{' '}
              {item.booking.isPreBooked ? 'Pre-booked' : 'Walk-in'}
            </div>
          </div>
        </div>
        <div className="flex-1"></div>
        {/* Step Pills */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#C0DD97] text-green-700 bg-green-50">B1 Tiếp nhận</span>
          <span className="text-slate-400 text-[11px]">›</span>
          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${!medicalRecord || !['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep) ? 'border-blue-200 text-blue-800 bg-blue-50 font-medium' : 'border-[#C0DD97] text-green-700 bg-green-50'}`}>B2 Khám & chỉ định</span>
          {(!medicalRecord || !['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep)) ? (
            <>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">B3 Thanh toán CLS</span>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">B4–B5 Thực hiện</span>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">B7 Kết luận</span>
            </>
          ) : (
            <>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#C0DD97] text-green-700 bg-green-50">B3-B6 Thanh toán & Làm CLS</span>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-blue-200 text-blue-800 bg-blue-50 font-medium">B7 Kết luận & Kê đơn</span>
            </>
          )}
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE BODY */}
      <div className="grid grid-cols-[280px_1fr_320px] flex-1 overflow-hidden">
        <ConsultationLeftPanel item={item} />
        
        <ConsultationCenterTabs 
          item={item} 
          medicalRecord={medicalRecord} 
          onChange={handleDataChange} 
        />
        
        <ConsultationRightPanel 
          item={item} 
          medicalRecord={medicalRecord}
          onFinalize={onSuccess}
        />
      </div>
    </div>
  );
}
