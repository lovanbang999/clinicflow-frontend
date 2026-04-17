'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';
import { useConsultation } from './ConsultationContext';

interface ConsultationHeaderProps {
  onExitRequest: () => void;
}

export function ConsultationHeader({ onExitRequest }: ConsultationHeaderProps) {
  const t = useTranslations('emr.visit');
  const { medicalRecord } = useConsultation();

  const visitStep = medicalRecord?.visitStep || '';
  const isB2Done = ['RESULTS_READY', 'DIAGNOSED', 'PRESCRIBED', 'COMPLETED'].includes(visitStep);

  return (
    <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-3 shrink-0 relative z-10 w-full mb-0 h-14">
      <Button
        variant="ghost"
        size="icon"
        onClick={onExitRequest}
        className="w-8 h-8 rounded border border-gray-200 text-slate-500 hover:bg-slate-100"
        title={t('shared.back')}
      >
        <ArrowLeftIcon size={14} weight="bold" />
      </Button>
      <div className="text-[14px] font-semibold text-slate-800 ml-1">
        {t('pageTitle')}
      </div>
      
      <div className="flex-1"></div>
      
      {/* Workflow Step Pills */}
      <div className="flex items-center gap-1">
        <StepPill label={t('workflow.b1')} status="completed" />
        <Separator />
        <StepPill label={t('workflow.b2')} status={isB2Done ? 'completed' : 'current'} />
        
        {!isB2Done ? (
          <>
            <Separator />
            <StepPill label={t('workflow.b3')} status="pending" />
            <Separator />
            <StepPill label={t('workflow.b4b5')} status="pending" />
            <Separator />
            <StepPill label={t('workflow.b7')} status="pending" />
          </>
        ) : (
          <>
            <Separator />
            <StepPill label={t('workflow.b3b6')} status="completed" />
            <Separator />
            <StepPill label={t('workflow.b7_long')} status="current" />
          </>
        )}
      </div>
    </div>
  );
}

function StepPill({ label, status }: { label: string; status: 'completed' | 'current' | 'pending' }) {
  const styles = {
    completed: 'border-[#C0DD97] text-green-700 bg-green-50',
    current: 'border-blue-200 text-blue-800 bg-blue-50 font-medium',
    pending: 'border-gray-200 text-gray-500 bg-gray-50',
  };

  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {label}
    </span>
  );
}

function Separator() {
  return <span className="text-slate-400 text-[11px]">›</span>;
}
