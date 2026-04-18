'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { labOrdersApi } from '@/lib/api/clinical/lab-orders';
import { useLabOrderSocket } from '@/lib/hooks/clinical/useLabOrderSocket';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { Service } from '@/types/service';

export interface DraftServiceOrder {
  service: Service;
  performedBy?: string;
}

interface ConsultationContextType {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  draftServices: DraftServiceOrder[];
  draftLabs: Service[];
  isSaving: boolean;
  isLoading: boolean;
  isPhase2: boolean;
  isLocked: boolean;
  
  setDraftServices: React.Dispatch<React.SetStateAction<DraftServiceOrder[]>>;
  setDraftLabs: React.Dispatch<React.SetStateAction<Service[]>>;
  refreshRecord: () => void;
  finalize: (onExit: () => void, onSuccess: () => void) => Promise<void>;
}

const ConsultationContext = createContext<ConsultationContextType | null>(null);

export function ConsultationProvider({ 
  children, 
  item 
}: { 
  children: React.ReactNode; 
  item: QueueRecord;
}) {
  const t = useTranslations('emr.visit');
  const [medicalRecord, setMedicalRecord] = useState<VisitResultsResponse | null>(null);
  const [draftServices, setDraftServices] = useState<DraftServiceOrder[]>([]);
  const [draftLabs, setDraftLabs] = useState<Service[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { joinBookingLabRoom, leaveBookingLabRoom, onLabResultCompleted } = useLabOrderSocket();
  const fetchRecord = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      const res = await medicalRecordsApi.getVisitResults(item.bookingId);
      setMedicalRecord(res);
    } catch (error) {
      console.error('Failed to fetch medical record:', error);
      if (!quiet) toast.error(t('messages.fetchError'));
    } finally {
      if (!quiet) setIsLoading(false);
    }
  }, [item.bookingId, t]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Real-time updates for lab results
  useEffect(() => {
    if (!item.bookingId) return;

    joinBookingLabRoom(item.bookingId);
    
    const unsubscribe = onLabResultCompleted((payload) => {
      console.log('Lab result completed, refreshing record:', payload);
      toast.info(`${t('tabs.labs')}: ${payload.testName} ${t('messages.resultReady', { defaultMessage: 'đã có kết quả' })}`);
      fetchRecord(true); // Quiet refresh
    });

    return () => {
      leaveBookingLabRoom(item.bookingId);
      if (unsubscribe) unsubscribe();
    };
  }, [item.bookingId, joinBookingLabRoom, leaveBookingLabRoom, onLabResultCompleted, fetchRecord, t]);

  const isPhase2 = !!medicalRecord && ['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep || '');
  const isLocked = !!medicalRecord && !['STARTED', 'SYMPTOMS_TAKEN'].includes(medicalRecord.visitStep || '') || ['PRESCRIBED', 'COMPLETED'].includes(medicalRecord?.visitStep || '');

  const finalize = useCallback(async (onExit: () => void, onSuccess: () => void) => {
    const isAlreadyFinalized = medicalRecord?.visitStep === 'PRESCRIBED' || medicalRecord?.visitStep === 'COMPLETED';
    
    if (isAlreadyFinalized) {
      onSuccess();
      return;
    }

    if (draftServices.length > 0 || draftLabs.length > 0) {
      setIsSaving(true);
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
        onExit();
      } catch (error) {
        console.error(error);
        toast.error(t('messages.orderError'));
      } finally {
        setIsSaving(false);
      }
    }
  }, [item.bookingId, medicalRecord?.visitStep, draftServices, draftLabs, t]);

  const value = {
    item,
    medicalRecord,
    draftServices,
    draftLabs,
    isSaving,
    isLoading,
    isPhase2,
    isLocked,
    setDraftServices,
    setDraftLabs,
    refreshRecord: fetchRecord,
    finalize,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultation must be used within a ConsultationProvider');
  }
  return context;
}
