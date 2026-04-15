'use client';

import { useState, useCallback, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { ConsultationLeftPanel } from './consultation/ConsultationLeftPanel';
import { ConsultationRightPanel } from './consultation/ConsultationRightPanel';
import type { Service } from '@/types/service';
import { labOrdersApi } from '@/lib/api/clinical/lab-orders';
import { toast } from 'sonner';
import { ConsultationCenterTabs } from './consultation/ConsultationCenterTabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface DraftServiceOrder {
  service: Service;
  performedBy?: string; // userId of specialist
}

interface DoctorConsultationViewProps {
  item: QueueRecord;
  onExit: () => void;
  onSuccess: () => void;
}

export function DoctorConsultationView({ item, onExit, onSuccess }: DoctorConsultationViewProps) {
  const t = useTranslations('emr.visit');
  const [medicalRecord, setMedicalRecord] = useState<VisitResultsResponse | null>(null);
  
  // Draft state for batch saving Phase 1
  const [draftServices, setDraftServices] = useState<DraftServiceOrder[]>([]);
  const [draftLabs, setDraftLabs] = useState<Service[]>([]);
  const [isSavingDrafts, setIsSavingDrafts] = useState(false);
  
  // Warning modal for early exit
  const [isExitWarningOpen, setIsExitWarningOpen] = useState(false);

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

  const handleFinalize = useCallback(async () => {
    const isFinalized = medicalRecord?.visitStep === 'PRESCRIBED' ||
      medicalRecord?.visitStep === 'COMPLETED';
    if (isFinalized) {
      onSuccess();
      return;
    }

    // Save drafts if any
    if (draftServices.length > 0 || draftLabs.length > 0) {
      setIsSavingDrafts(true);
      try {
        if (draftServices.length > 0) {
          await medicalRecordsApi.orderServices(item.bookingId, {
            items: draftServices.map(s => ({
              serviceId: s.service.id,
              performedBy: s.performedBy || undefined
            }))
          });
        }
        if (draftLabs.length > 0) {
          for (const lab of draftLabs) {
            await labOrdersApi.createOrder({
              bookingId: item.bookingId,
              testName: lab.name,
              serviceId: lab.id
            });
          }
        }
        toast.success(t('messages.orderSuccess'));
        setDraftServices([]);
        setDraftLabs([]);
        onExit(); // Phien tu van B2 xong, chuyen ca tiep theo
      } catch (error) {
        console.error(error);
        toast.error(t('messages.orderError'));
      } finally {
        setIsSavingDrafts(false);
      }
    } else {
      setIsExitWarningOpen(true);
    }
  }, [medicalRecord?.visitStep, draftServices, draftLabs, item.bookingId, onSuccess, onExit]);

  const handleExitRequest = useCallback(() => {
    const isFinalized = medicalRecord?.visitStep === 'PRESCRIBED' ||
      medicalRecord?.visitStep === 'COMPLETED';
    
    if (isFinalized) {
      onExit();
    } else {
      setIsExitWarningOpen(true);
    }
  }, [medicalRecord?.visitStep, onExit]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f5f5f3] overflow-hidden text-[13px]">
      {/* TOP HEADER */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-3 shrink-0 relative z-10 w-full mb-0 h-14">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExitRequest}
          className="w-8 h-8 rounded border border-gray-200 text-slate-500 hover:bg-slate-100"
          title={t('shared.back')}
        >
          <ArrowLeftIcon size={14} weight="bold" />
        </Button>
        <div className="text-[14px] font-semibold text-slate-800 ml-1">
          {t('pageTitle')}
        </div>
        
        <div className="flex-1"></div>
        {/* Step Pills */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#C0DD97] text-green-700 bg-green-50">{t('workflow.b1')}</span>
          <span className="text-slate-400 text-[11px]">›</span>
          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${!medicalRecord || !['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep) ? 'border-blue-200 text-blue-800 bg-blue-50 font-medium' : 'border-[#C0DD97] text-green-700 bg-green-50'}`}>{t('workflow.b2')}</span>
          {(!medicalRecord || !['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep)) ? (
            <>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">{t('workflow.b3')}</span>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">{t('workflow.b4b5')}</span>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50">{t('workflow.b7')}</span>
            </>
          ) : (
            <>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-[#C0DD97] text-green-700 bg-green-50">{t('workflow.b3b6')}</span>
              <span className="text-slate-400 text-[11px]">›</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full border border-blue-200 text-blue-800 bg-blue-50 font-medium">{t('workflow.b7_long')}</span>
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
          draftServices={draftServices}
          setDraftServices={setDraftServices}
          draftLabs={draftLabs}
          setDraftLabs={setDraftLabs}
          onChange={handleDataChange} 
        />
        
        <ConsultationRightPanel 
          item={item} 
          medicalRecord={medicalRecord}
          draftServices={draftServices}
          draftLabs={draftLabs}
          isSaving={isSavingDrafts}
          onFinalize={handleFinalize}
        />
      </div>

      <AlertDialog open={isExitWarningOpen} onOpenChange={setIsExitWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('exitWarning.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('exitWarning.desc')}
              <br/><br/>
              {t('exitWarning.note')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('exitWarning.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onExit} className="bg-red-600 hover:bg-red-700 text-white">
              {t('exitWarning.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
