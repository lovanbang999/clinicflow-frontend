'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import type { CreateMedicalRecordDto } from '@/lib/api/clinical/medical-records';

interface PrintableExaminationResultProps {
  patientProfile?: {
    fullName: string;
    patientCode?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
    weightKg?: number;
    heightCm?: number;
  };
  doctorName?: string;
  medicalRecord: CreateMedicalRecordDto;
  bookingCode?: string;
}

export function PrintableExaminationResult({
  patientProfile,
  doctorName,
  medicalRecord,
  bookingCode,
}: PrintableExaminationResultProps) {
  const t = useTranslations('doctorWorkspace.printables.exam');
  const tQueue = useTranslations('doctorWorkspace.queueView');

  if (!patientProfile) return null;

  const age = patientProfile.dateOfBirth
    ? new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()
    : 'N/A';

  const genderStr = patientProfile.gender === 'MALE' ? tQueue('gender.male') : patientProfile.gender === 'FEMALE' ? tQueue('gender.female') : tQueue('gender.other');

  return (
    <div 
      id="printable-exam-result" 
      className="hidden print:block w-full bg-white p-8 text-black font-sans leading-relaxed"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold uppercase">{t('clinicName')}</h1>
          <p className="text-xs">{t('address')}</p>
          <p className="text-xs">{t('contact')}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase mb-1">{t('title')}</h2>
          <p className="text-xs">{t('printDate')} {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          {bookingCode && <p className="text-sm font-bold mt-1">{t('patientCode')} {patientProfile.patientCode || bookingCode}</p>}
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-y-2 text-sm">
          <div className="col-span-8">
            <span className="font-semibold">{t('fullName')}</span> <span className="font-bold text-base uppercase">{patientProfile.fullName}</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold">{t('age')}</span> {age}
          </div>
          <div className="col-span-2 text-right">
            <span className="font-semibold">{t('gender')}</span> {genderStr}
          </div>
          
          <div className="col-span-12">
            <span className="font-semibold">{t('addressLabel')}</span> <span className="text-gray-700">Đống Đa, Hà Nội</span>
          </div>
          
          <div className="col-span-4">
            <span className="font-semibold">{t('weight')}</span> {patientProfile.weightKg || '...'} kg
          </div>
          <div className="col-span-4">
            <span className="font-semibold">{t('height')}</span> {patientProfile.heightCm || '...'} cm
          </div>
          <div className="col-span-4 text-right">
             <span className="font-semibold">{t('phone')}</span> {patientProfile.phone || 'N/A'}
          </div>
        </div>
      </div>

      {/* Clinical Exam Content */}
      <div className="space-y-6 mb-8 text-sm">
        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">{t('reasonLabel')}</h3>
          <p className="whitespace-pre-wrap italic">{medicalRecord.chiefComplaint || 'N/A'}</p>
        </div>

        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">{t('clinicalLabel')}</h3>
          <p className="whitespace-pre-wrap">{medicalRecord.clinicalFindings || 'N/A'}</p>
        </div>

        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">{t('diagnosisLabel')}</h3>
          <p className="font-bold text-base">
            [{medicalRecord.diagnosisCode}] {medicalRecord.diagnosisName}
          </p>
        </div>

        <div className="border border-gray-200 rounded p-3">
          <h3 className="font-bold uppercase text-gray-800 border-b border-gray-100 pb-1 mb-2">{t('treatmentLabel')}</h3>
          <p className="whitespace-pre-wrap font-medium">{medicalRecord.treatmentPlan || 'Nghỉ ngơi và theo dõi sức khỏe.'}</p>
        </div>

        {medicalRecord.followUpDate && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <h3 className="font-bold uppercase text-blue-800 pb-1 mb-1">{t('followUpLabel')}</h3>
            <p className="font-bold text-lg">
              {format(new Date(medicalRecord.followUpDate), 'dd/MM/yyyy')}
            </p>
            <p className="text-xs text-blue-600 italic">{t('followUpNote')}</p>
          </div>
        )}
      </div>

      {/* Footer Area */}
      <div className="mt-12 flex justify-end">
        <div className="w-2/5 text-center">
          <p className="text-sm italic mb-1">
            {t('dateFormat', { day: format(new Date(), 'dd'), month: format(new Date(), 'MM'), year: format(new Date(), 'yyyy') })}
          </p>
          <p className="font-bold text-sm uppercase mb-20 text-gray-900">{t('doctorTitle')}</p>
          <p className="font-bold text-base text-blue-700">{doctorName || 'Dr. SmartClinic'}</p>
          <p className="text-[10px] text-gray-500 font-medium">{t('signatureNote')}</p>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 print:block hidden">
        {t('slogan')}
      </div>
    </div>
  );
}
