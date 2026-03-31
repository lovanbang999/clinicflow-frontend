'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { bookingsApi } from '@/lib/api/bookings';
import type { CreateMedicalRecordDto, PrescriptionItemDto } from '@/lib/api/medical-records';
import { SpinnerIcon } from '@phosphor-icons/react';
import type { QueueRecord } from '@/lib/api/queue';
import { DoctorEMRTab } from './DoctorEMRTab';
import { DoctorHistoryTab } from './DoctorHistoryTab';
import { usePatientHistory } from '@/lib/hooks/usePatientHistory';
import { DoctorPatientBanner } from './DoctorPatientBanner';
import { DoctorVitalsStrip } from './DoctorVitalsStrip';
import { DoctorPrescriptionTab } from './DoctorPrescriptionTab';
import { DoctorLabTab } from './DoctorLabTab';
import { PrintablePrescription } from './PrintablePrescription';
import { useMedicalRecordActions } from '@/lib/hooks/useMedicalRecords';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { PrintableExaminationResult } from './PrintableExaminationResult';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { PrinterIcon, CheckCircleIcon } from '@phosphor-icons/react';

interface DoctorExamViewProps {
  item: QueueRecord;
  onExit: () => void;
  onRefreshQueue?: () => void;
}

type TabId = 'emr' | 'hist' | 'rx' | 'lab';

export function DoctorExamView({ item, onExit, onRefreshQueue }: DoctorExamViewProps) {
  const t = useTranslations('dashboard.doctor.workspace.examView');
  const tForm = useTranslations('dashboard.emr.form');
  const [activeTab, setActiveTab] = useState<TabId>('emr');

  const { history, isLoading: isHistoryLoading } = usePatientHistory(item.booking.patientProfileId);
  const { upsertRecord, isPerformingAction: isSavingRecord } = useMedicalRecordActions();
  const [isFinishing, setIsFinishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastRecordData, setLastRecordData] = useState<CreateMedicalRecordDto | null>(null);

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

  const watchedValues = useWatch({
    control: methods.control,
    name: ['prescriptionItems', 'diagnosisName', 'diagnosisCode', 'treatmentPlan']
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any, finalize: boolean = false): Promise<boolean> => {
    try {
      setIsFinishing(finalize);
      
      // Sanitize data before submission - explicitly pick only DTO allowed fields
      const submissionData: CreateMedicalRecordDto = {
        bookingId: item.booking.id,
        chiefComplaint: data.chiefComplaint,
        clinicalFindings: data.clinicalFindings,
        diagnosisCode: data.diagnosisCode,
        diagnosisName: data.diagnosisName,
        treatmentPlan: data.treatmentPlan,
        doctorNotes: data.doctorNotes,
        followUpNote: data.followUpNote,
        isFinalized: finalize,
        completeVisit: finalize,
        // Convert empty string to undefined and ensure valid ISO 8601 format if date exists
        followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : undefined,
        prescriptionItems: data.prescriptionItems?.map((p: PrescriptionItemDto) => ({
          medicineName: p.medicineName,
          dosage: p.dosage,
          frequency: p.frequency,
          durationDays: p.durationDays,
          quantity: p.quantity,
          unit: p.unit,
          instructions: p.instructions,
        })),
      };
      
      await upsertRecord(submissionData);
      if (finalize) {
        toast.success(tForm('messages.visitCompleted') || 'Visit completed');
        // Notify that pharmacy invoice was auto-created if prescription exists
        const hasPrescription = submissionData.prescriptionItems && submissionData.prescriptionItems.length > 0;
        if (hasPrescription) {
          setTimeout(() => {
            toast.info(tForm('messages.pharmacyInvoiceCreated') || 'Pharmacy Invoice Created', {
              description: tForm('messages.pharmacyInvoiceDesc') || 'System has automatically created a pharmacy invoice.',
              duration: 6000,
            });
          }, 500);
        }
        
        // Instead of handleFinish, show the print modal
        setLastRecordData(submissionData);
        setShowPrintModal(true);
      } else {
        toast.success(tForm('messages.savedDraft') || 'Draft saved');
      }
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error(tForm('messages.saveError') || 'Error saving', { description: msg });
      return false;
    } finally {
      setIsFinishing(false);
    }
  };

  const onSaveDraft = async () => {
    const data = methods.getValues();
    const success = await onSubmit(data, false);
    if (success) {
      onExit();
    }
  };

  const onFinishVisit = methods.handleSubmit(async (data) => {
    await onSubmit(data, true);
  });

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
          <div className="contents">
            {/* Dynamic Body */}
            <div className={activeTab === 'emr' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorEMRTab
                key={item.booking.id}
                bookingId={item.booking.id}
              />
            </div>

            <div className={activeTab === 'rx' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorPrescriptionTab />
            </div>

            <div className={activeTab === 'lab' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorLabTab 
                bookingId={item.booking.id} 
                patientProfile={item.booking.patientProfile}
                doctorName={item.booking.doctor?.fullName}
                bookingCode={item.booking.bookingCode}
              />
            </div>

            <div className={activeTab === 'hist' ? "animate-in fade-in duration-300 block" : "hidden"}>
              <DoctorHistoryTab
                history={history}
                isLoading={isHistoryLoading}
              />
            </div>

            {/* Sticky Bottom Bar */}
            <footer className="fixed bottom-0 right-0 left-0 md:left-64 flex justify-end items-center px-8 py-4 gap-3 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              {methods.watch('isFinalized') ? (
                <Button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-8 font-bold shadow-lg shadow-blue-600/20 cursor-pointer flex items-center gap-2 rounded-xl transition-all active:scale-[0.98]"
                >
                  <PrinterIcon size={20} weight="bold" />
                  {tForm('actions.print') || 'In Phiếu Kết Quả'}
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSaveDraft}
                    disabled={isSavingRecord || isFinishing}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-700 h-10 px-6 font-semibold border-gray-200 cursor-pointer"
                  >
                    {tForm('actions.saveDraft')}
                  </Button>
                  <Button
                    type="button"
                    onClick={onFinishVisit}
                    disabled={isSavingRecord || isFinishing || !watchedValues?.[2]}
                    className="bg-green-600 hover:bg-green-700 text-white h-10 px-6 font-semibold shadow-sm cursor-pointer"
                  >
                    {tForm('actions.finishAndNext')}
                  </Button>
                </>
              )}
            </footer>
          </div>
        )}
      </main>

      {/* Hidden printable components */}
      {(activeTab === 'rx' || showPrintModal) && (
        <PrintablePrescription
          patientProfile={item.booking.patientProfile}
          doctorName={item.booking.doctor?.fullName}
          prescriptionItems={watchedValues?.[0] || []}
          diagnosisName={watchedValues?.[1]}
          diagnosisCode={watchedValues?.[2]}
          treatmentPlan={watchedValues?.[3]}
          bookingCode={item.booking.bookingCode}
          weight={item.booking.patientProfile?.weightKg?.toString()}
          height={item.booking.patientProfile?.heightCm?.toString()}
        />
      )}
      {(activeTab === 'emr' || showPrintModal) && (
        <PrintableExaminationResult
           patientProfile={item.booking.patientProfile}
           doctorName={item.booking.doctor?.fullName}
           medicalRecord={lastRecordData || methods.getValues()}
           bookingCode={item.booking.bookingCode}
        />
      )}

      {/* Completion & Print Modal */}
      <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
        <DialogContent className="sm:max-w-md p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-2">
              <CheckCircleIcon size={40} weight="fill" />
            </div>
            
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
                {t('printModal.title')}
              </DialogTitle>
              <DialogDescription className="text-base pt-3 text-gray-600">
                {t.rich('printModal.description', {
                  fullName: item.booking.patientProfile?.fullName || '',
                  name: (chunks) => <span className="font-bold text-gray-900">{chunks}</span>
                })}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPrintModal(false);
                  handleFinish();
                }}
                className="flex-1 h-12 border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
              >
                {t('printModal.skip')}
              </Button>
              <Button
                className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-6 font-bold shadow-lg shadow-blue-600/20"
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                  setTimeout(() => handleFinish(), 500);
                }}
              >
                <PrinterIcon size={20} weight="bold" />
                {t('printModal.printAndContinue')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </FormProvider>
  );
}
