import { useTranslations } from 'next-intl';
import type { QueueRecord } from '@/lib/api/appointment/queue';

interface DoctorVitalsStripProps {
  item: QueueRecord;
}

export function DoctorVitalsStrip({ item }: DoctorVitalsStripProps) {
  const t = useTranslations('doctorWorkspace.examView');
  const patient = item.booking.patientProfile;

  // Ideally, these would be fetched from the API based on the last triage reading
  const weight = patient?.weightKg ? `${patient.weightKg}` : '--';
  const height = patient?.heightCm ? `${patient.heightCm}` : '--';
  
  // Calculate BMI if weight and height are available
  let bmi = '--';
  if (patient?.weightKg && patient?.heightCm) {
    const hInMeters = patient.heightCm / 100;
    const calcBmi = patient.weightKg / (hInMeters * hInMeters);
    bmi = calcBmi.toFixed(1);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 border border-slate-100 bg-slate-50 mt-4 rounded-xl overflow-hidden divide-x divide-slate-100">
      
      <div className="flex flex-col justify-center p-3 bg-white">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('vitals.bloodPressure')}</p>
        <p className="text-[16px] font-extrabold text-slate-900 tracking-tight">--/-- <small className="text-[10px] font-semibold text-slate-400 font-sans ml-0.5">mmHg</small></p>
      </div>

      <div className="flex flex-col justify-center p-3 bg-white">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('vitals.pulse')}</p>
        <p className="text-[16px] font-extrabold text-slate-900 tracking-tight">-- <small className="text-[10px] font-semibold text-slate-400 font-sans ml-0.5">l/ph</small></p>
      </div>

      <div className="flex flex-col justify-center p-3 bg-white">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('vitals.spo2')}</p>
        <p className="text-[16px] font-extrabold text-slate-900 tracking-tight">-- <small className="text-[10px] font-semibold text-slate-400 font-sans ml-0.5">%</small></p>
      </div>

      <div className="flex flex-col justify-center p-3 bg-white">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('vitals.temperature')}</p>
        <p className="text-[16px] font-extrabold text-slate-900 tracking-tight">-- <small className="text-[10px] font-semibold text-slate-400 font-sans ml-0.5">°C</small></p>
      </div>

      <div className="flex flex-col justify-center p-3 bg-white">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('vitals.weight')}</p>
        <p className="text-[16px] font-extrabold text-slate-900 tracking-tight">{weight} <small className="text-[10px] font-semibold text-slate-400 font-sans ml-0.5">kg</small></p>
      </div>

      <div className="flex flex-col justify-center p-3 bg-white">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{t('vitals.height')}</p>
        <p className="text-[16px] font-extrabold text-slate-900 tracking-tight">{height} <small className="text-[10px] font-semibold text-slate-400 font-sans ml-0.5">cm</small></p>
      </div>

      <div className="flex flex-col justify-center p-3 bg-indigo-50 border-none">
        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">{t('vitals.bmi')}</p>
        <p className="text-[16px] font-extrabold text-indigo-700 tracking-tight">
          {bmi}
        </p>
      </div>
      
    </div>
  );
}
