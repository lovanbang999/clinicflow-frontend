'use client';

import { useState, useCallback } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { useTranslations } from 'next-intl';
import { ConsultationLeftPanel } from './consultation/ConsultationLeftPanel';
import { ConsultationRightPanel } from './consultation/ConsultationRightPanel';
import type { Service } from '@/types/service';
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
import { ConsultationProvider, useConsultation } from './consultation/ConsultationContext';
import { ConsultationHeader } from './consultation/ConsultationHeader';

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
  return (
    <ConsultationProvider item={item}>
      <ConsultationLayout onExit={onExit} onSuccess={onSuccess} />
    </ConsultationProvider>
  );
}

function ConsultationLayout({ onExit, onSuccess }: { onExit: () => void; onSuccess: () => void }) {
  const t = useTranslations('emr.visit');
  const { item, medicalRecord, draftServices, draftLabs, finalize, isSaving } = useConsultation();
  const [isExitWarningOpen, setIsExitWarningOpen] = useState(false);

  const handleFinalize = useCallback(() => {
    finalize(onExit, onSuccess);
  }, [finalize, onExit, onSuccess]);

  const handleExitRequest = useCallback(() => {
    const isFinalized = medicalRecord?.visitStep === 'PRESCRIBED' || medicalRecord?.visitStep === 'COMPLETED';
    const hasUnsavedChanges = draftServices.length > 0 || draftLabs.length > 0;
    
    if (isFinalized || !hasUnsavedChanges) {
      onExit();
    } else {
      setIsExitWarningOpen(true);
    }
  }, [medicalRecord?.visitStep, draftServices.length, draftLabs.length, onExit]);

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#f5f5f3] overflow-hidden text-[13px]">
      <ConsultationHeader onExitRequest={handleExitRequest} />

      <div className="grid grid-cols-[280px_1fr_320px] flex-1 overflow-hidden">
        <ConsultationLeftPanel item={item} />
        <ConsultationCenterTabs />
        <ConsultationRightPanel 
          isSaving={isSaving}
          onFinalize={handleFinalize}
          onExitRequest={handleExitRequest}
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
