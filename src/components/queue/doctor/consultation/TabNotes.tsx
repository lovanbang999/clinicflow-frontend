'use client';

import { useState, useEffect } from 'react';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import { medicalRecordsApi, type VisitResultsResponse } from '@/lib/api/clinical/medical-records';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface TabNotesProps {
  item: QueueRecord;
  medicalRecord: VisitResultsResponse | null;
  onChange: () => void;
  isReadOnly?: boolean;
}

export function TabNotes({ item, medicalRecord, onChange, isReadOnly }: TabNotesProps) {
  const t = useTranslations('emr.visit.notesTab');
  const tShared = useTranslations('emr.visit.shared');
  const [notes, setNotes] = useState('');
  const [instructions, setInstructions] = useState(''); // Could map to followUpNote or similar if we wanted
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (medicalRecord) {
      setNotes(medicalRecord.doctorNotes || '');
      setInstructions(medicalRecord.followUpNote || '');
    }
  }, [medicalRecord]);

  const handleSave = async () => {
    if (isSubmitting || isReadOnly) return; // Prevent double save
    try {
      setIsSubmitting(true);
      // We use saveSymptoms for both doctorNotes, etc based on the API definition
      await medicalRecordsApi.saveSymptoms(item.bookingId, {
        doctorNotes: notes
      });
      onChange();
    } catch (error) {
      console.error(error);
      toast.error(t('errors.save'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-300">
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <div className="text-[13px] font-medium text-slate-800">{t('doctorNote')}</div>
          {isReadOnly && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2">{tShared('readOnly')}</span>}
        </div>
        
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-slate-500 mb-1">{t('clinicalComment')}</label>
          <textarea 
            className="w-full border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-h-[100px] disabled:opacity-70 disabled:bg-slate-50"
            placeholder={t('clinicalCommentPlaceholder')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            disabled={isReadOnly}
          />
        </div>

        <div>
           <label className="block text-[11px] font-medium text-slate-500 mb-1">{t('instructions')}</label>
          <textarea 
             className="w-full border border-gray-200 rounded-md p-2 text-[12px] focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-h-[80px] disabled:opacity-70 disabled:bg-slate-50"
             placeholder={t('instructionsPlaceholder')}
             value={instructions}
             onChange={(e) => setInstructions(e.target.value)}
             readOnly
             disabled={isReadOnly}
             title={t('wipFeature')}
          />
        </div>
      </div>
    </div>
  );
}
