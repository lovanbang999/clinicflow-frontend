'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { bookingsApi } from '@/lib/api/bookings';
import type { CreateMedicalRecordDto } from '@/lib/api/medical-records';
import { SpinnerIcon } from '@phosphor-icons/react';
import type { QueueRecord } from '@/lib/api/queue';
import { DoctorEMRTab } from './DoctorEMRTab';
import { DoctorHistoryTab } from './DoctorHistoryTab';
import { usePatientHistory } from '@/lib/hooks/usePatientHistory';
import { DoctorPatientBanner } from './DoctorPatientBanner';
import { DoctorVitalsStrip } from './DoctorVitalsStrip';

import { DoctorPrescriptionTab } from './DoctorPrescriptionTab';
import { DoctorLabTab } from './DoctorLabTab';

interface DoctorExamViewProps {
  item: QueueRecord;
  onExit: () => void;
  onRefreshQueue?: () => void;
}

type TabId = 'emr' | 'hist' | 'rx' | 'lab';

export function DoctorExamView({ item, onExit, onRefreshQueue }: DoctorExamViewProps) {
  const t = useTranslations('dashboard.doctor.workspace.examView');
  const [activeTab, setActiveTab] = useState<TabId>('emr');

  const { history, isLoading: isHistoryLoading } = usePatientHistory(item.booking.patientProfileId);
  const [isLoading, setIsLoading] = useState(true);

  const methods = useForm<CreateMedicalRecordDto>({
    defaultValues: {
      bookingId: item.booking.id,
      chiefComplaint: '',
      clinicalFindings: '',
      diagnosisCode: '',
      diagnosisName: '',
      treatmentPlan: '',
      doctorNotes: '',
      followUpDate: '',
      isFinalized: false,
      completeVisit: false,
      prescriptionItems: [],
    }
  });

  useEffect(() => {
    let active = true;
    bookingsApi
      .getById(item.booking.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => {
        if (active) {
          const mr = data.medicalRecord;
          if (mr) {
            methods.reset({
              ...mr,
              bookingId: item.booking.id,
              followUpDate: mr.followUpDate ? new Date(mr.followUpDate).toISOString().split('T')[0] : '',
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              prescriptionItems: mr.prescription?.items?.map((p: any) => ({
                 medicineName: p.medicineName,
                 dosage: p.dosage,
                 frequency: p.frequency,
                 durationDays: p.durationDays,
                 quantity: p.quantity,
                 unit: p.unit,
                 instructions: p.instructions,
              })) || []
            });
          }
          // Default doctor notes if available
          if (data.doctorNotes && (!mr || !mr.doctorNotes)) {
             methods.setValue('doctorNotes', data.doctorNotes);
          }
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setIsLoading(false);
      });
      
    return () => { active = false; };
  }, [item.booking.id, methods]);

  const handleFinish = () => {
    onRefreshQueue?.();
    onExit();
  };

  const tabs = [
    { id: 'emr', label: t('tabs.emr') },
    { id: 'rx', label: t('tabs.rx') },
    { id: 'lab', label: t('tabs.lab') },
    { id: 'hist', label: t('tabs.history') },
  ];

  return (
    <FormProvider {...methods}>
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] overflow-hidden" id="exam-mode">
        <main className="flex-1 overflow-y-auto p-6 pb-24" style={{ scrollbarWidth: 'thin' }}>

        {/* Banner and Vitals Container */}
        <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 mb-6">
          <DoctorPatientBanner item={item} />
          <DoctorVitalsStrip item={item} />
        </section>

        {/* Content Tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-gray-100/80 p-1.5 rounded-xl w-fit mb-6 shadow-sm border border-gray-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabId)}
              className={`px-5 py-2.5 rounded-lg text-[14px] transition-all cursor-pointer ${activeTab === tab.id
                  ? 'bg-white shadow-sm font-bold text-blue-600 border border-gray-200/50 ring-1 ring-black/5'
                  : 'hover:bg-gray-200/50 font-semibold text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#4b5f73]">
            <SpinnerIcon size={28} className="animate-spin text-[#1570ef]" />
            <span className="text-[12px]">{t('loading')}</span>
          </div>
        ) : (
          <>
            {/* Dynamic Body */}
            <div className={activeTab === 'emr' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorEMRTab
                key={item.booking.id}
                bookingId={item.booking.id}
                onFinished={handleFinish}
              />
            </div>

            <div className={activeTab === 'rx' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorPrescriptionTab bookingId={item.booking.id} />
            </div>

            <div className={activeTab === 'lab' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorLabTab bookingId={item.booking.id} />
            </div>

            <div className={activeTab === 'hist' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorHistoryTab
                history={history}
                isLoading={isHistoryLoading}
              />
            </div>
          </>
        )}
      </main>
    </div>
    </FormProvider>
  );
}
