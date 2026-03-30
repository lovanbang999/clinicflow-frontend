'use client';

import { useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { PrescriptionItemDto } from '@/lib/api/medical-records';

interface PrintablePrescriptionProps {
  patientProfile?: {
    fullName: string;
    patientCode?: string;
    dateOfBirth?: string;
    gender?: string;
    phone?: string;
  };
  doctorName?: string;
  prescriptionItems: PrescriptionItemDto[];
  diagnosisName?: string;
  diagnosisCode?: string;
  treatmentPlan?: string;
  bookingCode?: string;
  weight?: string;
  height?: string;
}

export function PrintablePrescription({
  patientProfile,
  doctorName,
  prescriptionItems,
  diagnosisName,
  diagnosisCode,
  treatmentPlan,
  bookingCode,
  weight,
  height,
}: PrintablePrescriptionProps) {
  const t = useTranslations('dashboard.doctor.workspace.printables.prescription');
  const tExam = useTranslations('dashboard.doctor.workspace.printables.exam');
  const tQueue = useTranslations('dashboard.doctor.workspace.queueView');
  
  if (!patientProfile) return null;

  const age = patientProfile.dateOfBirth
    ? new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()
    : 'N/A';

  const genderStr = patientProfile.gender === 'MALE' ? tQueue('gender.male') : patientProfile.gender === 'FEMALE' ? tQueue('gender.female') : tQueue('gender.other');

  return (
    <div 
      id="printable-prescription" 
      className="hidden print:block w-full bg-white p-8 text-black font-sans leading-relaxed"
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-xl font-bold uppercase">{tExam('clinicName')}</h1>
          <p className="text-xs">{tExam('address')}</p>
          <p className="text-xs">{tExam('contact')}</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold uppercase mb-1">{t('printTitle')}</h2>
          <p className="text-xs">{tExam('printDate')} {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          {bookingCode && <p className="text-sm font-bold mt-1">{tExam('patientCode')} {patientProfile.patientCode || bookingCode}</p>}
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-6">
        <div className="grid grid-cols-12 gap-y-2 text-sm">
          <div className="col-span-8">
            <span className="font-semibold">{tExam('fullName')}</span> <span className="font-bold text-base uppercase">{patientProfile.fullName}</span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold">{tExam('age')}</span> {age}
          </div>
          <div className="col-span-2 text-right">
            <span className="font-semibold">{tExam('gender')}</span> {genderStr}
          </div>
          
          <div className="col-span-12">
            <span className="font-semibold">{tExam('addressLabel')}</span> <span className="text-gray-700">Đống Đa, Hà Nội</span>
          </div>
          
          <div className="col-span-4">
            <span className="font-semibold">{tExam('weight')}</span> {weight || '...'} kg
          </div>
          <div className="col-span-4">
            <span className="font-semibold">{tExam('height')}</span> {height || '...'} cm
          </div>
          <div className="col-span-4 text-right">
             <span className="font-semibold">{tExam('phone')}</span> {patientProfile.phone || 'N/A'}
          </div>
        </div>
      </div>

      {/* Diagnosis Section */}
      <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded">
        <p className="text-sm">
          <span className="font-bold uppercase mr-2 text-gray-800">{t('diagnosisLabelTitle')}</span>
          <span className="font-semibold">
            {diagnosisName ? `${diagnosisName} ${diagnosisCode ? `(${diagnosisCode})` : ''}` : t('noDiagnosis')}
          </span>
        </p>
        {treatmentPlan && (
          <p className="text-sm mt-1">
            <span className="font-bold uppercase mr-2 text-gray-800">{t('adviceLabel')}</span>
            <span className="italic">{treatmentPlan}</span>
          </p>
        )}
      </div>

      {/* Prescription Table */}
      <div className="mb-8">
        <h3 className="text-base font-bold uppercase mb-3 border-b border-black pb-1">{t('prescriptionTitle')}</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="text-left py-2 font-bold w-10">{t('colStt')}</th>
              <th className="text-left py-2 font-bold">{t('colMedicine')}</th>
              <th className="text-center py-2 font-bold w-20">{t('colQuantity')}</th>
              <th className="text-center py-2 font-bold w-20">{t('colUnit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {prescriptionItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-500 italic">{t('emptyPrescription')}</td>
              </tr>
            ) : (
              prescriptionItems.map((item, index) => (
                <tr key={index} className="align-top">
                  <td className="py-3 text-center">{index + 1}</td>
                  <td className="py-3">
                    <div className="font-bold text-gray-900">{item.medicineName}</div>
                    <div className="text-xs text-gray-700 mt-1 font-medium italic">
                      {item.dosage} - {item.frequency} {item.durationDays ? `- ${t('duration', { days: item.durationDays })}` : ''}
                    </div>
                    {item.instructions && (
                      <div className="text-xs text-blue-800 mt-1">{t('instructions', { instructions: item.instructions })}</div>
                    )}
                  </td>
                  <td className="py-3 text-center font-bold">{item.quantity}</td>
                  <td className="py-3 text-center uppercase text-xs">{item.unit}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Signature Area */}
      <div className="mt-12 flex justify-between items-start">
        <div className="w-1/2">
          <p className="text-xs font-bold uppercase underline mb-2 tracking-tight">{t('footerNoteTitle')}</p>
          <p className="text-[11px] leading-tight text-gray-600">
            {t('footerNote1')}<br/>
            {t('footerNote2')}<br/>
            {t('footerNote3')}
          </p>
        </div>
        <div className="w-2/5 text-center">
          <p className="text-sm italic mb-1">
            {tExam('dateFormat', { day: format(new Date(), 'dd'), month: format(new Date(), 'MM'), year: format(new Date(), 'yyyy') })}
          </p>
          <p className="font-bold text-sm uppercase mb-20 text-gray-900">{tExam('doctorTitle')}</p>
          <p className="font-bold text-base text-blue-700">{doctorName || 'Dr. SmartClinic'}</p>
          <p className="text-[10px] text-gray-500 font-medium">{tExam('signatureNote')}</p>
        </div>
      </div>

      {/* Page number or watermark if needed */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 print:block hidden">
        {t('slogan')}
      </div>
    </div>
  );
}
