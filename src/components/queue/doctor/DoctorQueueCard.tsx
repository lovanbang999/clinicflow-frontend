'use client';

import { useTranslations } from 'next-intl';
import { BookingStatus } from '@/types';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import {
  ArrowRightIcon,
  ClipboardTextIcon,
  PrinterIcon,
  QueueIcon,
  CalendarBlankIcon,
  ClockIcon,
  TimerIcon,
} from '@phosphor-icons/react';

interface DoctorQueueCardProps {
  item: QueueRecord;
  onCall: (id: string) => void;
  onEnterExam: (id: string) => void;
  onPrint?: (id: string) => void;
  isCallDisabled?: boolean;
}

interface TaskStyle {
  accent: string;
  labelBg: string;
  avatarBg: string;
  dotBg: string;
  btnBg: string;
  icon: React.ReactNode;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

export function DoctorQueueCard({ item, onCall, onEnterExam, onPrint, isCallDisabled }: DoctorQueueCardProps) {

  const status = item.booking.status;
  const patient = item.booking.patientProfile;
  const name = patient?.fullName ?? 'N/A';
  
  // Task Type Detection
  const isSpecialistExam = item.isVisitServiceOrder;
  const visitStep = item.booking.medicalRecord?.visitStep;
  const isResultsReady = visitStep === 'RESULTS_READY';
  
  const taskType: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY' = 
    isSpecialistExam ? 'EXAMINATION' : isResultsReady ? 'RESULTS_READY' : 'CONSULTATION';

  const style = getTaskStyles(taskType);
  const isUrgent = (item.estimatedWaitMinutes || 0) > 40;
  const isNoShow = status === BookingStatus.NO_SHOW;

  return (
    <div className={`group bg-white rounded-xl transition-all duration-300 hover:shadow-xl hover:shadow-[#1275e2]/5 border border-[#c4c6cf]/20 relative overflow-hidden flex flex-col ${isNoShow ? 'opacity-50 pointer-events-none' : ''} ${isUrgent && status === BookingStatus.CHECKED_IN ? 'border-[#F7C1C1] bg-gradient-to-b from-white to-[#fffafa]' : ''} ${isResultsReady ? 'border-[#9FE1CB] bg-gradient-to-b from-white to-[#f8fffc]' : ''}`}>
      
      <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
          <Avatar initials={getInitials(name)} style={style} isNoShow={isNoShow} />
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-1.5">
              <h4 className={`font-bold text-lg text-[#191c20] ${isNoShow ? 'line-through' : ''}`}>{name}</h4>
              <BookingCode code={item.booking.bookingCode} />
              <TaskBadge type={taskType} style={style} />
              <BookingTypeBadge isPreBooked={item.isPreBooked} />
              {isUrgent && status === BookingStatus.CHECKED_IN && <UrgentBadge minutes={item.estimatedWaitMinutes} />}
            </div>

            <PatientDetails 
              serviceName={item.booking.service?.name} 
              age={patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '?'}
              gender={patient?.gender}
              isPreBooked={item.isPreBooked}
              scheduledTime={item.scheduledTime}
              createdAt={item.booking.createdAt}
            />

            <ClinicalTags allergies={patient?.allergies} chronicConditions={patient?.chronicConditions} />
          </div>
        </div>

        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 shrink-0">
          <WaitTime minutes={item.estimatedWaitMinutes} isUrgent={isUrgent} />
          <CardActions 
            status={status} 
            taskType={taskType} 
            onCall={() => onCall(item.booking.id)} 
            onEnterExam={() => onEnterExam(item.booking.id)} 
            onPrint={() => onPrint?.(item.booking.id)}
            isCallDisabled={isCallDisabled}
            style={style}
          />
        </div>
      </div>
    </div>
  );
}

function Avatar({ initials, style, isNoShow }: { initials: string; style: TaskStyle; isNoShow: boolean }) {
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

function TaskBadge({ type, style }: { type: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY'; style: TaskStyle }) {
  const t = useTranslations('doctorWorkspace.queueView');
  const labels = {
    EXAMINATION: t('status.awaitingExam'),
    RESULTS_READY: t('stats.waitingResults'),
    CONSULTATION: t('status.awaitingConsultation')
  };
  return (
    <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${style.labelBg}`}>
      {style.icon}
      {labels[type]}
    </span>
  );
}

function BookingCode({ code }: { code?: string }) {
  return (
    <span className="px-2 py-0.5 rounded-lg bg-[#f3f4f9] text-[#44474e] text-[10px] font-mono tracking-tight border border-[#c4c6cf]/30">
      {code}
    </span>
  );
}

function BookingTypeBadge({ isPreBooked }: { isPreBooked?: boolean }) {
  const t = useTranslations('doctorWorkspace.queueView');
  return isPreBooked ? (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eff6ff] text-[#1275e2] text-[10px] font-bold border border-[#93c5fd]/60">
      <CalendarBlankIcon size={10} weight="fill" />
      {t('status.preBooked')}
    </span>
  ) : (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f0fdf4] text-[#16a34a] text-[10px] font-bold border border-[#86efac]/60">
      <QueueIcon size={10} weight="fill" />
      {t('status.walkIn')}
    </span>
  );
}

function UrgentBadge({ minutes }: { minutes?: number }) {
  const t = useTranslations('doctorWorkspace.queueView');
  return (
    <span className="px-2 py-0.5 rounded-md bg-[#FCEBEB] text-[#A32D2D] text-[10px] font-bold border border-[#F7C1C1] animate-pulse">
      {t('waitingTooLong', { minutes: minutes ?? 0, defaultMessage: `Waiting too long — ${minutes ?? 0} mins` })}
    </span>
  );
}

function PatientDetails({ serviceName, age, gender, isPreBooked, scheduledTime, createdAt }: { serviceName?: string; age: string | number; gender?: string | null; isPreBooked?: boolean; scheduledTime?: string | null; createdAt?: string | Date }) {
  const t = useTranslations('doctorWorkspace.queueView');
  const genderStr = gender === 'MALE' ? t('gender.male') : gender === 'FEMALE' ? t('gender.female') : t('gender.other');
  
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[#44474e] text-sm">
      <div className="flex items-center gap-1.5">
        <ClipboardTextIcon size={16} className="text-[#1275e2]" weight="fill" />
        <span className="font-semibold">{serviceName || t('generalExam')}</span>
      </div>
      <span className="text-[#c4c6cf]">•</span>
      <p>{age} {t('age')}</p>
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
  );
}

function ClinicalTags({ allergies, chronicConditions }: { allergies?: string | null; chronicConditions?: string | null }) {
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

function WaitTime({ minutes, isUrgent }: { minutes?: number | null; isUrgent: boolean }) {
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

function CardActions({ status, taskType, onCall, onEnterExam, onPrint, isCallDisabled, style }: { status: BookingStatus; taskType: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY'; onCall: () => void; onEnterExam: () => void; onPrint?: () => void; isCallDisabled?: boolean; style: TaskStyle }) {
  const t = useTranslations('doctorWorkspace.queueView');
  
  if (status === BookingStatus.IN_PROGRESS || status === BookingStatus.AWAITING_RESULTS) {
    return (
      <button onClick={onEnterExam} className={`h-11 px-6 rounded-xl font-bold transition-all flex items-center gap-2 group/btn cursor-pointer shadow-lg ${style.btnBg}`}>
        {taskType === 'RESULTS_READY' ? t('actions.readResults') : t('actions.enterExam')}
        <ArrowRightIcon size={16} className="transition-transform group-hover/btn:translate-x-1" weight="bold" />
      </button>
    );
  }

  if (status === BookingStatus.CHECKED_IN) {
    return (
      <button disabled={isCallDisabled} onClick={onCall} className={`h-11 px-6 rounded-xl font-bold transition-all flex items-center gap-2 group/btn cursor-pointer shadow-md ${isCallDisabled ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none' : style.btnBg}`}>
        {taskType === 'EXAMINATION' ? t('actions.startExamination') : t('actions.startConsultation')}
        <ArrowRightIcon size={16} className={`transition-transform ${!isCallDisabled ? 'group-hover/btn:translate-x-1' : ''}`} weight="bold" />
      </button>
    );
  }

  if (status === BookingStatus.COMPLETED) {
    return (
      <button onClick={onPrint} className="h-11 px-6 rounded-xl bg-white text-[#1275e2] font-bold border border-[#1275e2]/30 hover:bg-[#e0efff] transition-all flex items-center gap-2 group/btn cursor-pointer">
        {t('actions.printResult')}
        <PrinterIcon size={18} weight="bold" />
      </button>
    );
  }

  return null;
}

function getTaskStyles(type: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY'): TaskStyle {
  const styles = {
    CONSULTATION: {
      accent: '#185FA5',
      labelBg: 'bg-[#E6F1FB] text-[#0C447C] border-[#B5D4F4]',
      avatarBg: 'bg-[#E6F1FB] text-[#0C447C] border-[#B5D4F4]',
      dotBg: 'bg-[#FAC775]',
      btnBg: 'bg-gradient-to-b from-[#1f6db5] to-[#155b9d] text-white shadow-[#1560a8]/24 hover:from-[#1a63a6] hover:to-[#0f4c85]',
      icon: <ClipboardTextIcon size={12} weight="bold" />
    },
    EXAMINATION: {
      accent: '#7F77DD',
      labelBg: 'bg-[#EEEDFE] text-[#3C3489] border-[#CECBF6]',
      avatarBg: 'bg-[#EEEDFE] text-[#3C3489] border-[#CECBF6]',
      dotBg: 'bg-[#7F77DD]',
      btnBg: 'bg-gradient-to-b from-[#5f56c3] to-[#4e45b0] text-white shadow-[#534ab7]/24 hover:from-[#564db8] hover:to-[#433aa5]',
      icon: <QueueIcon size={12} weight="bold" />
    },
    RESULTS_READY: {
      accent: '#1D9E75',
      labelBg: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
      avatarBg: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
      dotBg: 'bg-[#22c55e]',
      btnBg: 'bg-gradient-to-b from-[#138063] to-[#0d6a51] text-white shadow-[#0d6e56]/22 hover:from-[#0f7359] hover:to-[#095b46]',
      icon: <ArrowRightIcon size={12} weight="bold" />
    }
  };
  return styles[type as keyof typeof styles];
}
