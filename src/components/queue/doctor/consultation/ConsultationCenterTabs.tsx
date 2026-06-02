'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { TabVitals } from './TabVitals';
import { TabLabs } from './TabLabs';
import { TabNotes } from './TabNotes';
import { TabServices } from './TabServices';
import { TabResults } from './TabResults';
import { TabDiagnosis } from './TabDiagnosis';
import { TabPrescription } from './TabPrescription';
import { useConsultation } from './ConsultationContext';

export function ConsultationCenterTabs() {
  const t = useTranslations('emr.visit');
  const {
    item,
    medicalRecord,
    draftServices,
    setDraftServices,
    draftLabs,
    setDraftLabs,
    refreshRecord,
    isPhase2,
    isVitalsLocked,
    isDiagnosisLocked,
    isPrescriptionLocked
  } = useConsultation();

  // selectedTab is the user's interactive choice.
  // The actual activeTab is dynamically derived based on the current clinical flow phase.
  const [selectedTab, setSelectedTab] = useState<string>('');

  let activeTab = selectedTab;
  if (!activeTab) {
    activeTab = isPhase2 ? 'results' : 'vitals';
  }

  // Force activeTab boundaries depending on the active phase
  if (isPhase2) {
    if (['services', 'labs', 'notes'].includes(activeTab)) {
      activeTab = 'results';
    }
  } else {
    if (['results', 'diagnosis', 'prescription'].includes(activeTab)) {
      activeTab = 'vitals';
    }
  }

  const orderCount = (medicalRecord?.visitServiceOrders?.length || 0) + draftServices.length;
  const labCount = (medicalRecord?.labOrders?.length || 0) + draftLabs.length;

  return (
    <div className="flex flex-col overflow-hidden bg-white/50">
      {/* Tabs Header */}
      <div className="flex bg-white border-b border-gray-200 px-5 gap-6 shrink-0">
        <TabHeaderItem
          label={t('tabs.vitals')}
          isActive={activeTab === 'vitals'}
          onClick={() => setSelectedTab('vitals')}
        />
        {!isPhase2 ? (
          <>
            <TabHeaderItem
              label={t('tabs.services')}
              isActive={activeTab === 'services'}
              onClick={() => setSelectedTab('services')}
              count={orderCount}
            />
            <TabHeaderItem
              label={t('tabs.labs')}
              isActive={activeTab === 'labs'}
              onClick={() => setSelectedTab('labs')}
              count={labCount}
            />
            <TabHeaderItem
              label={t('tabs.notes')}
              isActive={activeTab === 'notes'}
              onClick={() => setSelectedTab('notes')}
            />
          </>
        ) : (
          <>
            <TabHeaderItem
              label={t('tabs.results')}
              isActive={activeTab === 'results'}
              onClick={() => setSelectedTab('results')}
            />
            <TabHeaderItem
              label={t('tabs.diagnosis')}
              isActive={activeTab === 'diagnosis'}
              onClick={() => setSelectedTab('diagnosis')}
            />
            <TabHeaderItem
              label={t('tabs.prescription')}
              isActive={activeTab === 'prescription'}
              onClick={() => setSelectedTab('prescription')}
            />
          </>
        )}
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-y-auto p-5 pb-10" style={{ scrollbarWidth: 'thin' }}>
        <div className={activeTab === 'vitals' ? 'block h-full min-h-0' : 'hidden'}>
          <TabVitals item={item} medicalRecord={medicalRecord} onChange={refreshRecord} isReadOnly={isVitalsLocked} />
        </div>

        {!isPhase2 && activeTab === 'services' && (
          <TabServices
            item={item}
            medicalRecord={medicalRecord}
            draftServices={draftServices}
            setDraftServices={setDraftServices}
            onChange={refreshRecord}
            isReadOnly={isVitalsLocked}
          />
        )}
        {!isPhase2 && activeTab === 'labs' && (
          <TabLabs
            item={item}
            medicalRecord={medicalRecord}
            draftLabs={draftLabs}
            setDraftLabs={setDraftLabs}
            onChange={refreshRecord}
            isReadOnly={isVitalsLocked}
          />
        )}
        {!isPhase2 && activeTab === 'notes' && (
          <TabNotes item={item} medicalRecord={medicalRecord} onChange={refreshRecord} isReadOnly={isVitalsLocked} />
        )}

        {isPhase2 && activeTab === 'results' && (
          <TabResults item={item} medicalRecord={medicalRecord} />
        )}
        {isPhase2 && activeTab === 'diagnosis' && (
          <TabDiagnosis item={item} medicalRecord={medicalRecord} onChange={refreshRecord} isReadOnly={isDiagnosisLocked} />
        )}
        {isPhase2 && activeTab === 'prescription' && (
          <TabPrescription item={item} medicalRecord={medicalRecord} onChange={refreshRecord} isReadOnly={isPrescriptionLocked} />
        )}
      </div>
    </div>
  );
}

function TabHeaderItem({ label, isActive, onClick, count }: { label: string; isActive: boolean; onClick: () => void; count?: number }) {
  return (
    <div
      className={`py-3 text-[13px] cursor-pointer border-b-[3px] flex items-center gap-1.5 transition-colors -mb-px hover:text-slate-800 ${isActive ? 'text-blue-600 border-blue-500 font-medium' : 'text-slate-500 border-transparent'
        }`}
      onClick={onClick}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className="text-[10px] bg-blue-50 text-blue-800 rounded-full px-1.5 py-0 min-w-[16px] text-center border border-blue-100">
          {count}
        </span>
      )}
    </div>
  );
}
