'use client';

import { useTranslations } from 'next-intl';
import { type VisitResultsResponse } from '@/lib/api/medical-records';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, PrinterIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { StickyBottomBar } from '@/components/doctor/shared/StickyBottomBar';

// Modular Components
import { SummaryDashboard } from './summary/SummaryDashboard';
import { MedicalReport } from './summary/MedicalReport';

interface SummaryTabProps {
  record: VisitResultsResponse | null;
  onBack?: () => void;
  onExit?: () => void;
}

export function SummaryTab({ record, onBack, onExit }: SummaryTabProps) {
  const t = useTranslations('emr.visit.summary');
  const commonT = useTranslations('emr.visit');

  if (!record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative">
      {/* 
            1. WEB DISPLAY COMPONENT
            Visible only on screen, hidden during print
        */}
      <div className="print:hidden">
        <SummaryDashboard record={record} />
      </div>

      {/* 
            2. FORMAL MEDICAL REPORT COMPONENT
            Hidden on screen, visible only during print
            Matches system ID for printing: "printable-exam-result"
        */}
      <MedicalReport record={record} />

      {/* 
            3. STICKY NAVIGATION BAR
            Always hidden during print
        */}
      <StickyBottomBar title={t('stickyTitle')} className="print:hidden">
        <div className="flex items-center gap-3 ml-auto">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-6 py-2 h-[42px] rounded-xl text-gray-700 bg-white border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all mr-auto"
            >
              <ArrowLeftIcon size={16} />
              {commonT('prescription.back')}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="px-6 py-2 h-[42px] rounded-xl border-slate-200 text-slate-700 font-bold text-[14px] hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <PrinterIcon size={18} weight="bold" />
            {t('printBtn')}
          </Button>

          <Button
            type="button"
            onClick={onExit}
            className="px-6 py-2 h-[42px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[14px] shadow-[0_4px_12px_rgba(79,70,229,0.25)] transition-all flex items-center gap-2"
          >
            <CheckCircleIcon size={20} weight="bold" />
            {t('finishBtn')}
          </Button>
        </div>
      </StickyBottomBar>
    </div>
  );
}
