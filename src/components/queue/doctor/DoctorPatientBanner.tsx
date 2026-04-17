import type { QueueRecord } from '@/lib/api/appointment/queue';
import { useTranslations } from 'next-intl';
import { WarningCircleIcon, WarningIcon } from '@phosphor-icons/react';

interface DoctorPatientBannerProps {
  item: QueueRecord;
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
}

export function DoctorPatientBanner({ item }: DoctorPatientBannerProps) {
  const patient = item.booking.patientProfile;
  const name = patient?.fullName ?? 'N/A';
  const age = patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '?';

  return (
    <div className="flex flex-col lg:flex-row justify-between gap-6">
      <div className="flex gap-5">
        <PatientAvatar initials={getInitials(name)} />
        <div className="space-y-1.5 flex-1">
          <PatientInfo 
            name={name} 
            code={item.booking.bookingCode} 
            age={age} 
            gender={patient?.gender} 
            phone={patient?.phone} 
          />
          <PatientAlerts 
            allergies={patient?.allergies} 
            chronicConditions={patient?.chronicConditions} 
          />
        </div>
      </div>
    </div>
  );
}

function PatientAvatar({ initials }: { initials: string }) {
  return (
    <div className="relative shrink-0 mt-1">
      <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 font-bold text-[22px] flex items-center justify-center border border-blue-100 shadow-inner">
        {initials}
      </div>
      <div className="absolute -bottom-1 -right-1 bg-green-500 border-[3px] border-white w-5 h-5 rounded-full shadow-sm" />
    </div>
  );
}

interface PatientInfoProps {
  name: string;
  code?: string;
  age: string | number;
  gender?: string;
  phone?: string;
}

function PatientInfo({ name, code, age, gender, phone }: PatientInfoProps) {
  const tBanner = useTranslations('doctorWorkspace.examView.patientBanner');
  const tQueue = useTranslations('doctorWorkspace.queueView');
  const genderStr = gender === 'MALE' ? tQueue('gender.male') : gender === 'FEMALE' ? tQueue('gender.female') : tQueue('gender.other');

  return (
    <>
      <div className="flex items-center gap-3">
        <h2 className="text-[20px] font-bold text-gray-900 leading-none">{name}</h2>
        <span className="bg-gray-100/80 text-gray-600 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border border-gray-200">
          {code}
        </span>
      </div>
      
      <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[13px] text-slate-600 mt-1">
        <span className="flex items-center gap-1.5 font-medium">👤 {age} {tBanner('age')}</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="flex items-center gap-1.5 font-medium">⚥ {tBanner('gender')} {genderStr}</span>
        {phone && (
          <>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1.5 font-medium">📞 {phone}</span>
          </>
        )}
      </div>
    </>
  );
}

interface PatientAlertsProps {
  allergies?: string | null;
  chronicConditions?: string | null;
}

function PatientAlerts({ allergies, chronicConditions }: PatientAlertsProps) {
  const tBanner = useTranslations('doctorWorkspace.examView.patientBanner');
  if (!allergies && !chronicConditions) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1.5">
      {allergies && (
        <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-md text-xs font-semibold border border-red-100">
          <WarningIcon size={14} weight="bold" /> 
          {tBanner('allergy')} {allergies}
        </span>
      )}
      {chronicConditions && (
        <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-md text-xs font-semibold border border-orange-100">
          <WarningCircleIcon size={14} weight="bold" />
          {chronicConditions}
        </span>
      )}
    </div>
  );
}
