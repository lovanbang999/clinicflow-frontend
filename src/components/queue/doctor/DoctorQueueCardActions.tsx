import { useTranslations } from 'next-intl';
import { ArrowRightIcon, PrinterIcon } from '@phosphor-icons/react';
import { BookingStatus } from '@/types';
import type { TaskStyle } from './DoctorQueueCardStyles';

interface CardActionsProps {
  status: BookingStatus;
  taskType: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY';
  onCall: () => void;
  onEnterExam: () => void;
  onPrint?: () => void;
  isCallDisabled?: boolean;
  style: TaskStyle;
}

export function CardActions({
  status,
  taskType,
  onCall,
  onEnterExam,
  onPrint,
  isCallDisabled,
  style,
}: CardActionsProps) {
  const t = useTranslations('doctorWorkspace.queueView');

  if (status === BookingStatus.IN_PROGRESS || status === BookingStatus.AWAITING_RESULTS) {
    return (
      <button
        onClick={onEnterExam}
        className={`h-11 px-6 rounded-xl font-bold transition-all flex items-center gap-2 group/btn cursor-pointer shadow-lg ${style.btnBg}`}
      >
        {taskType === 'RESULTS_READY' ? t('actions.readResults') : t('actions.enterExam')}
        <ArrowRightIcon size={16} className="transition-transform group-hover/btn:translate-x-1" weight="bold" />
      </button>
    );
  }

  if (status === BookingStatus.CHECKED_IN) {
    return (
      <button
        disabled={isCallDisabled}
        onClick={onCall}
        className={`h-11 px-6 rounded-xl font-bold transition-all flex items-center gap-2 group/btn cursor-pointer shadow-md ${
          isCallDisabled
            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
            : style.btnBg
        }`}
      >
        {taskType === 'EXAMINATION' ? t('actions.startExamination') : t('actions.startConsultation')}
        <ArrowRightIcon
          size={16}
          className={`transition-transform ${!isCallDisabled ? 'group-hover/btn:translate-x-1' : ''}`}
          weight="bold"
        />
      </button>
    );
  }

  if (status === BookingStatus.COMPLETED) {
    return (
      <button
        onClick={onPrint}
        className="h-11 px-6 rounded-xl bg-white text-[#1275e2] font-bold border border-[#1275e2]/30 hover:bg-[#e0efff] transition-all flex items-center gap-2 group/btn cursor-pointer"
      >
        {t('actions.printResult')}
        <PrinterIcon size={18} weight="bold" />
      </button>
    );
  }

  return null;
}
