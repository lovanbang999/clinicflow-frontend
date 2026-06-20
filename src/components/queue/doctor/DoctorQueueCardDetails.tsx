import { useTranslations } from 'next-intl';
import { ClipboardTextIcon, ClockIcon, TimerIcon } from '@phosphor-icons/react';
import type { TaskStyle } from './DoctorQueueCardStyles';
import { calcAge, formatGender } from '@/lib/utils/patient.utils';

export function Avatar({
  initials,
  style,
  isNoShow,
}: {
  initials: string;
  style: TaskStyle;
  isNoShow: boolean;
}) {
  return (
    <div className="relative shrink-0">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border ${style.avatarBg}`}>
        {initials}
      </div>
      {!isNoShow && (
        <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${style.dotBg}`} />
      )}
    </div>
  );
}

export function PatientDetails({
  serviceName,
  dateOfBirth,
  gender,
  isPreBooked,
  scheduledTime,
  createdAt,
  patientNotes,
}: {
  serviceName?: string;
  dateOfBirth?: string;
  gender?: string | null;
  isPreBooked?: boolean;
  scheduledTime?: string | null;
  createdAt?: string | Date;
  patientNotes?: string | null;
}) {
  const t = useTranslations('doctorWorkspace.queueView');
  
  const age = calcAge(dateOfBirth);
  const genderStr = formatGender(gender || undefined, {
    male: t('gender.male'),
    female: t('gender.female'),
    other: t('gender.other'),
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#44474e] text-sm">
        <div className="flex items-center gap-1.5">
          <ClipboardTextIcon size={16} className="text-[#1275e2]" weight="fill" />
          <span className="font-semibold">{serviceName || t('generalExam')}</span>
        </div>
        <span className="text-[#c4c6cf]">•</span>
        <p>
          {age} {t('age')}
        </p>
        <span className="text-[#c4c6cf]">•</span>
        <p>{genderStr}</p>

        {isPreBooked && scheduledTime && (
          <>
            <span className="text-[#c4c6cf]">•</span>
            <div className="flex items-center gap-1 text-[#1275e2] font-medium">
              <ClockIcon size={14} weight="fill" />
              {scheduledTime}
            </div>
          </>
        )}
        {!isPreBooked && createdAt && (
          <>
            <span className="text-[#c4c6cf]">•</span>
            <div className="flex items-center gap-1 text-[#44474e]/60">
              <ClockIcon size={14} />
              {new Date(createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </>
        )}
      </div>

      {patientNotes && (
        <div className="flex items-start gap-1.5 text-xs text-[#5c5f66] bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 max-w-xl transition-all duration-200 hover:border-slate-200">
          <span className="font-bold text-[#2e3033] shrink-0">{t('reasonForVisit') || 'Lý do khám'}:</span>
          <span className="italic truncate select-all">{"\""}{patientNotes}{"\""}</span>
        </div>
      )}
    </div>
  );
}

export function ClinicalTags({
  allergies,
  chronicConditions,
}: {
  allergies?: string | null;
  chronicConditions?: string | null;
}) {
  const t = useTranslations('doctorWorkspace.queueView');
  if (!allergies && !chronicConditions) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2.5">
      {allergies && (
        <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#ba1a1a] text-[9px] font-bold uppercase tracking-wider">
          {t('tags.allergy')}: {allergies}
        </span>
      )}
      {chronicConditions && (
        <span className="px-2 py-0.5 rounded bg-[#f3f4f9] text-[#191c20] text-[9px] font-bold uppercase tracking-wider border border-[#c4c6cf]/30">
          {chronicConditions}
        </span>
      )}
    </div>
  );
}

export function WaitTime({ minutes, isUrgent }: { minutes?: number | null; isUrgent: boolean }) {
  const t = useTranslations('doctorWorkspace.queueView');
  return (
    <div className="text-right hidden sm:block">
      <div className={`flex items-center gap-1.5 text-xs font-bold ${isUrgent ? 'text-[#A32D2D]' : 'text-[#44474e]'}`}>
        <TimerIcon size={14} weight={isUrgent ? 'fill' : 'regular'} />
        {minutes || 0} {t('minutes')}
      </div>
      <p className="text-[9px] text-[#44474e]/60 font-bold uppercase tracking-widest mt-1">{t('statusLabel')}</p>
    </div>
  );
}
