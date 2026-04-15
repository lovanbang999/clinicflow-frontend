'use client';

import { useState } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import type { VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import type { Service } from '@/types/service';
import { useTranslations } from 'next-intl';
import { TabVitals } from './TabVitals';
import { TabLabs } from './TabLabs';
import { TabNotes } from './TabNotes';
import { TabServices } from './TabServices';
import { TabResults } from './TabResults';
import { TabDiagnosis } from './TabDiagnosis';
import { TabPrescription } from './TabPrescription';
import type { DraftServiceOrder } from '../DoctorConsultationView';

interface ConsultationCenterTabsProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  draftServices: DraftServiceOrder[];
  setDraftServices: (val: DraftServiceOrder[]) => void;
  draftLabs: Service[];
  setDraftLabs: (val: Service[]) => void;
  onChange: () => void;
}

export function ConsultationCenterTabs({
  item,
  medicalRecord,
  draftServices,
  setDraftServices,
  draftLabs,
  setDraftLabs,
  onChange,
}: ConsultationCenterTabsProps) {
  const t = useTranslations('emr.visit');
  const [activeTab, setActiveTab] = useState<string>('');

  const isPhase2 = medicalRecord && ['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(medicalRecord.visitStep);

  // Initialize and adjust active tab
  if (!activeTab) {
    setActiveTab(isPhase2 ? 'results' : 'vitals');
  } else if (isPhase2 && ['services', 'labs'].includes(activeTab)) {
    setActiveTab('results'); // Force tab switch if entering Phase 2
  } else if (!isPhase2 && ['results', 'diagnosis', 'prescription'].includes(activeTab)) {
    setActiveTab('vitals'); // Force tab switch if reverting to Phase 1
  }

  const orderCount = (medicalRecord?.visitServiceOrders?.length || 0) + draftServices.length;
  const labCount = (medicalRecord?.labOrders?.length || 0) + draftLabs.length;

  return (
    <div className="flex flex-col overflow-hidden bg-white/50">
      {/* Tabs Header */}
      <div className="flex bg-white border-b border-gray-200 px-5 gap-6 shrink-0">
        <div
          className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${
            activeTab === 'vitals' ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
          }`}
          onClick={() => setActiveTab('vitals')}
        >
          {t('tabs.vitals')}
        </div>
        {!isPhase2 ? (
          <>
            <div
              className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${
                activeTab === 'services' ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
              }`}
              onClick={() => setActiveTab('services')}
            >
              {t('tabs.services')}
              {orderCount > 0 && <span className="text-[10px] bg-blue-50 text-blue-800 rounded-full px-1.5 py-0 min-w-[16px] text-center border border-blue-100">{orderCount}</span>}
            </div>
            <div
              className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${
                activeTab === 'labs' ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
              }`}
              onClick={() => setActiveTab('labs')}
            >
              {t('tabs.labs')}
              {labCount > 0 && <span className="text-[10px] bg-blue-50 text-blue-800 rounded-full px-1.5 py-0 min-w-[16px] text-center border border-blue-100">{labCount}</span>}
            </div>
            <div
              className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${
                activeTab === 'notes' ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
              }`}
              onClick={() => setActiveTab('notes')}
            >
              {t('tabs.notes')}
            </div>
          </>
        ) : (
          <>
            <div
              className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${
                activeTab === 'results' ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
              }`}
              onClick={() => setActiveTab('results')}
            >
              {t('tabs.results')}
            </div>
            <div
              className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${
                activeTab === 'diagnosis' ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
              }`}
              onClick={() => setActiveTab('diagnosis')}
            >
              {t('tabs.diagnosis')}
            </div>
            <div
              className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${
                activeTab === 'prescription' ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
              }`}
              onClick={() => setActiveTab('prescription')}
            >
              {t('tabs.prescription')}
            </div>
          </>
        )}
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-10" style={{ scrollbarWidth: 'thin' }}>
        <div className={activeTab === 'vitals' ? 'block h-full min-h-0' : 'hidden'}>
          <TabVitals item={item} medicalRecord={medicalRecord} onChange={onChange} isReadOnly={!!isPhase2} />
        </div>
        
        {/* Phase 1 Tabs */}
        {!isPhase2 && activeTab === 'services' && (
          <TabServices 
            item={item} 
            medicalRecord={medicalRecord} 
            draftServices={draftServices}
            setDraftServices={setDraftServices}
            onChange={onChange} 
          />
        )}
        {!isPhase2 && activeTab === 'labs' && (
          <TabLabs 
            item={item} 
            medicalRecord={medicalRecord} 
            draftLabs={draftLabs}
            setDraftLabs={setDraftLabs}
            onChange={onChange} 
          />
        )}
        {!isPhase2 && activeTab === 'notes' && (
          <TabNotes item={item} medicalRecord={medicalRecord} onChange={onChange} />
        )}

        {/* Phase 2 Tabs */}
        {isPhase2 && activeTab === 'results' && (
          <TabResults item={item} medicalRecord={medicalRecord} />
        )}
        {isPhase2 && activeTab === 'diagnosis' && (
          <TabDiagnosis item={item} medicalRecord={medicalRecord} onChange={onChange} />
        )}
        {isPhase2 && activeTab === 'prescription' && (
          <TabPrescription item={item} medicalRecord={medicalRecord} onChange={onChange} />
        )}
      </div>
    </div>
  );
}
