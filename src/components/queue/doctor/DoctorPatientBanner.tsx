import type { QueueRecord } from '@/lib/api/queue';
import { useTranslations } from 'next-intl';
import { CheckIcon, WarningCircleIcon, WarningIcon, PhoneIcon } from '@phosphor-icons/react';

interface DoctorPatientBannerProps {
  item: QueueRecord;
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
}

export function DoctorPatientBanner({ item }: DoctorPatientBannerProps) {
  const tBanner = useTranslations('dashboard.doctor.workspace.examView.patientBanner');
  const tQueue = useTranslations('dashboard.doctor.workspace.queueView');

  const patient = item.booking.patientProfile;
  const name = patient?.fullName ?? 'N/A';
  const bookingCode = item.booking.bookingCode ?? '';
  const age = patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '?';
  const genderStr = patient?.gender === 'MALE' ? tQueue('gender.male') : patient?.gender === 'FEMALE' ? tQueue('gender.female') : tQueue('gender.other');
  const initials = getInitials(name);
  const phone = patient?.phone ?? '';

  return (
    <div className="flex flex-col lg:flex-row justify-between gap-6">
      
      {/* Left Side: Avatar & Info */}
      <div className="flex gap-5">
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-lg bg-blue-50 text-blue-600 font-bold text-2xl flex items-center justify-center border border-gray-100">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 border-4 border-white w-6 h-6 rounded-full flex items-center justify-center" title={tBanner('examining')}>
            <CheckIcon weight="bold" className="text-white text-[12px]" />
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold">{bookingCode}</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{age} {tBanner('age')}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{tBanner('gender')} {genderStr}</span>
            {phone && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1 font-medium">
                  <PhoneIcon size={14} weight="fill" /> {phone}
                </span>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {patient?.allergies && (
              <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-md text-xs font-semibold border border-red-100 cursor-pointer">
                <WarningIcon size={14} weight="bold" /> 
                {tBanner('allergy')} {patient.allergies}
              </span>
            )}
            {patient?.chronicConditions && (
              <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-md text-xs font-semibold border border-orange-100">
                <WarningCircleIcon size={14} weight="bold" />
                {patient.chronicConditions}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
