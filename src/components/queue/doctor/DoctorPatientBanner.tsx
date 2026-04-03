import type { QueueRecord } from '@/lib/api/queue';
import { useTranslations } from 'next-intl';
import { WarningCircleIcon, WarningIcon } from '@phosphor-icons/react';

interface DoctorPatientBannerProps {
  item: QueueRecord;
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
}

export function DoctorPatientBanner({ item }: DoctorPatientBannerProps) {
  const tBanner = useTranslations('doctorWorkspace.examView.patientBanner');
  const tQueue = useTranslations('doctorWorkspace.queueView');

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
        <div className="relative shrink-0 mt-1">
          <div className="w-16 h-16 rounded-xl bg-blue-50 text-blue-600 font-bold text-[22px] flex items-center justify-center border border-blue-100 shadow-inner">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-green-500 border-[3px] border-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm" title={tBanner('examining')}>
          </div>
        </div>
        
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-bold text-gray-900 leading-none">{name}</h2>
            <span className="bg-gray-100/80 text-gray-600 px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border border-gray-200">{bookingCode}</span>
          </div>
          
          <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-[13px] text-slate-600 mt-1">
            <span className="flex items-center gap-1.5 font-medium">👤 {age} {tBanner('age')}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="flex items-center gap-1.5 font-medium">⚥ {tBanner('gender')} {genderStr}</span>
            {phone && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1.5 font-medium">
                  📞 {phone}
                </span>
              </>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 pt-1.5">
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
