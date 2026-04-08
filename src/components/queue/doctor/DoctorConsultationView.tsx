'use client';

import type { QueueRecord } from '@/lib/api/appointment/queue';
import { DoctorPatientBanner } from './DoctorPatientBanner';
import { DoctorVitalsStrip } from './DoctorVitalsStrip';
import { ServiceSelectionSection } from '@/components/doctor/tabs/ServiceSelectionSection';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useTranslations } from 'next-intl';

interface DoctorConsultationViewProps {
  item: QueueRecord;
  onExit: () => void;
  onSuccess: () => void;
}

export function DoctorConsultationView({ item, onExit, onSuccess }: DoctorConsultationViewProps) {
  const t = useTranslations('emr.visit');

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] overflow-hidden" id="consultation-mode">
      <main className="flex-1 overflow-y-auto p-6 pb-20" style={{ scrollbarWidth: 'thin' }}>
        
        {/* Header with Back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={onExit}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <ArrowLeftIcon size={18} weight="bold" />
            <span className="font-bold">{t('shared.back')}</span>
          </Button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('consultation.title')}</h1>
        </div>

        {/* Patient Banner & Vitals */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8 transition-all hover:shadow-md">
          <DoctorPatientBanner item={item} />
          <div className="mt-6 pt-6 border-t border-slate-100">
            <DoctorVitalsStrip item={item} />
          </div>
        </section>

        {/* Specialized Section: Service Selection (Consultation) */}
        <div className="w-full max-w-4xl mx-auto">
          <ServiceSelectionSection 
            bookingId={item.booking.id} 
            onSuccess={onSuccess} 
          />
        </div>

        {/* Informative Note */}
        <div className="mt-12 bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-blue-800 max-w-2xl mx-auto text-sm">
          <p className="font-bold mb-1">{t('consultation.guideTitle')}</p>
          <p className="opacity-80">
            {t.rich('consultation.guideContent', {
              strong: (chunks) => <strong className="font-bold">{chunks}</strong>,
            })}
          </p>
        </div>
      </main>
    </div>
  );
}
