'use client';

import { useTranslations } from 'next-intl';
import { BookingStatus } from '@/types';
import type { QueueRecord } from '@/lib/api/queue';
import { 
  ArrowRightIcon, 
  GenderFemaleIcon, 
  GenderMaleIcon, 
  GenderNeuterIcon,
  ClipboardTextIcon,
  PrinterIcon
} from '@phosphor-icons/react';

interface DoctorQueueCardProps {
  item: QueueRecord;
  onCall: (id: string) => void;
  onEnterExam: (id: string) => void;
  onPrint?: (id: string) => void;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

function getAvatarColors(name: string) {
  const colors = [
    { bg: '#1275e2', text: '#ffffff' },
    { bg: '#006c4b', text: '#ffffff' },
    { bg: '#ba1a1a', text: '#ffffff' },
    { bg: '#6b538c', text: '#ffffff' },
    { bg: '#00677e', text: '#ffffff' },
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

export function DoctorQueueCard({ item, onCall, onEnterExam, onPrint }: DoctorQueueCardProps) {
  const t = useTranslations('dashboard.doctor.workspace.queueView');
  console.log('item', item.booking.id);

  const status = item.booking.status;
  const patient = item.booking.patientProfile;
  const name = patient?.fullName ?? 'N/A';
  const bookingCode = item.booking.bookingCode ?? '';
  const serviceName = item.booking.service?.name ?? '';
  const age = patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '?';
  const genderStr = patient?.gender === 'MALE' ? t('gender.male') : patient?.gender === 'FEMALE' ? t('gender.female') : t('gender.other');
  
  const initials = getInitials(name);
  const avatarColors = getAvatarColors(name);

  // Status mappings
  let statusBg = 'bg-[#f3f4f9] text-[#44474e] border-[#c4c6cf]/30';
  let statusLbl = t('status.waiting');
  let isOpacified = false;
  let isCrossed = false;

  if (status === BookingStatus.IN_PROGRESS) {
    statusBg = 'bg-[#e0efff] text-[#1275e2] border-[#1275e2]/10';
    statusLbl = t('status.inProgress');
  } else if (status === BookingStatus.NO_SHOW) {
    isOpacified = true;
    isCrossed = true;
    statusBg = 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/10';
    statusLbl = t('status.noShow');
  } else if (status === BookingStatus.COMPLETED) {
    statusBg = 'bg-[#e0efff] text-[#1275e2] border-[#1275e2]/10';
    statusLbl = t('status.completed');
  } else if (status === BookingStatus.CHECKED_IN) {
    statusBg = 'bg-[#f3f4f9] text-[#44474e] border-[#c4c6cf]/30';
  }

  return (
    <div className={`group bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#1275e2]/5 border border-[#c4c6cf]/20 relative overflow-hidden ${isOpacified ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Section */}
        <div className="flex items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl"
              style={{ background: isOpacified ? '#f3f4f9' : avatarColors.bg, color: isOpacified ? '#44474e' : avatarColors.text }}
            >
              {initials}
            </div>
            {!isOpacified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#c4c6cf]/20 flex items-center justify-center text-[#1275e2] shadow-sm">
                {patient?.gender === 'FEMALE' ? (
                  <GenderFemaleIcon size={14} weight="bold" />
                ) : patient?.gender === 'MALE' ? (
                  <GenderMaleIcon size={14} weight="bold" />
                ) : (
                  <GenderNeuterIcon size={14} weight="bold" />
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <h4 className={`font-bold text-xl text-[#191c20] ${isCrossed ? 'line-through' : ''}`}>{name}</h4>
              <span className="px-2 py-0.5 rounded-lg bg-[#f3f4f9] text-[#44474e] text-[10px] font-bold tracking-tight border border-[#c4c6cf]/30">
                {bookingCode}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-[#44474e]">
              <div className="flex items-center gap-1.5 text-sm">
                <ClipboardTextIcon size={18} className="opacity-60" weight="fill" />
                <span className="font-medium">{serviceName || t('generalExam')}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#c4c6cf] opacity-50"></span>
              <p className="text-sm font-medium">{age} {t('age')}</p>
              <span className="w-1 h-1 rounded-full bg-[#c4c6cf] opacity-50"></span>
              <p className="text-sm font-medium">{genderStr}</p>
            </div>

            {/* Tags (if any exist on the patient) */}
            {(patient?.allergies || patient?.chronicConditions) && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {patient.allergies && (
                  <span className="px-2 py-1 rounded-md bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                    {t('tags.allergy')} {patient.allergies}
                  </span>
                )}
                {patient.chronicConditions && (
                  <span className="px-2 py-1 rounded-md bg-[#e2e2e9] text-[#191c20] text-[10px] font-bold">
                    {patient.chronicConditions}
                  </span>
                )}
                {item.booking.medicalRecord && !item.booking.medicalRecord.isFinalized && (
                  <span className="px-2 py-1 rounded-md bg-[#fff7d1] text-[#725a00] text-[10px] font-bold border border-[#725a00]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#725a00] animate-pulse"></span>
                    {t('tags.draft', { defaultMessage: 'Bản nháp' })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-between sm:justify-end gap-10 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#c4c6cf]/10 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-[#44474e] font-bold uppercase tracking-widest mb-1.5">{t('statusLabel')}</p>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-lg font-bold text-xs border ${statusBg}`}>
              {statusLbl}
            </span>
          </div>

          {status === BookingStatus.IN_PROGRESS ? (
            <button
              onClick={() => onEnterExam(item.booking.id)}
              className="h-12 px-8 rounded-xl bg-[#1275e2] text-white font-bold shadow-lg shadow-[#1275e2]/25 hover:shadow-[#1275e2]/40 active:scale-[0.98] transition-all flex items-center gap-2 group/btn cursor-pointer"
            >
              {t('actions.enterExam')}
              <ArrowRightIcon size={18} className="transition-transform group-hover/btn:translate-x-1" weight="bold" />
            </button>
          ) : status === BookingStatus.CHECKED_IN ? (
            <button
              onClick={() => onCall(item.booking.id)}
              className="h-12 px-8 rounded-xl bg-white text-[#1275e2] font-bold shadow-sm shadow-[#1275e2]/5 border border-[#1275e2]/30 hover:bg-[#e0efff]/50 active:scale-[0.98] transition-all flex items-center gap-2 group/btn cursor-pointer"
            >
              {t('actions.callPatient')}
              <ArrowRightIcon size={18} className="transition-transform group-hover/btn:translate-x-1" weight="bold" />
            </button>
          ) : status === BookingStatus.COMPLETED ? (
            <button
              onClick={() => onPrint?.(item.booking.id)}
              className="h-12 px-8 rounded-xl bg-[#edf1f8] text-[#1275e2] font-bold border border-[#1275e2]/30 hover:bg-[#e0efff] active:scale-[0.98] transition-all flex items-center gap-2 group/btn cursor-pointer"
            >
              {t('actions.printResult')}
              <PrinterIcon size={18} className="transition-transform group-hover/btn:scale-110" weight="bold" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
