import { useTranslations } from 'next-intl';
import type { QueueRecord } from '@/lib/api/queue';

interface DoctorVitalsStripProps {
  item: QueueRecord;
}

export function DoctorVitalsStrip({ item }: DoctorVitalsStripProps) {
  const t = useTranslations('dashboard.doctor.workspace.examView');
  const patient = item.booking.patientProfile;

  // Ideally, these would be fetched from the API based on the last triage reading
  const weight = patient?.weightKg ? `${patient.weightKg}` : '--';
  const height = patient?.heightCm ? `${patient.heightCm}` : '--';
  
  // Calculate BMI if weight and height are available
  let bmi = '--';
  let bmiStatus = '';
  if (patient?.weightKg && patient?.heightCm) {
    const hInMeters = patient.heightCm / 100;
    const calcBmi = patient.weightKg / (hInMeters * hInMeters);
    bmi = calcBmi.toFixed(1);
    
    if (calcBmi < 18.5) bmiStatus = t('vitalsStatus.underweight');
    else if (calcBmi < 25) bmiStatus = t('vitalsStatus.normal');
    else if (calcBmi < 30) bmiStatus = t('vitalsStatus.overweight');
    else bmiStatus = t('vitalsStatus.obese');
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6 pt-6 border-t border-gray-100">
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('vitals.bloodPressure')}</p>
        <p className="text-lg font-bold text-gray-900">--/-- <span className="text-xs font-normal text-gray-500">mmHg</span></p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('vitals.pulse')}</p>
        <p className="text-lg font-bold text-gray-900">-- <span className="text-xs font-normal text-gray-500">l/ph</span></p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('vitals.spo2')}</p>
        <p className="text-lg font-bold text-gray-900">-- <span className="text-xs font-normal text-gray-500">%</span></p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('vitals.temperature')}</p>
        <p className="text-lg font-bold text-gray-900">-- <span className="text-xs font-normal text-gray-500">°C</span></p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('vitals.weight')}</p>
        <p className="text-lg font-bold text-gray-900">{weight} <span className="text-xs font-normal text-gray-500">kg</span></p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-[11px] text-gray-500 font-medium mb-1 uppercase tracking-wider">{t('vitals.height')}</p>
        <p className="text-lg font-bold text-gray-900">{height} <span className="text-xs font-normal text-gray-500">cm</span></p>
      </div>

      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
        <p className="text-[11px] text-blue-600 font-semibold mb-1 uppercase tracking-wider">{t('vitals.bmi')}</p>
        <p className="text-lg font-bold text-blue-700">
          {bmi} <span className="text-xs font-normal text-blue-500">{bmiStatus}</span>
        </p>
      </div>
      
    </div>
  );
}
