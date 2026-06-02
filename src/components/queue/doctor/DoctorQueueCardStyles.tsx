import type { ReactNode } from 'react';
import { ClipboardTextIcon, QueueIcon, ArrowRightIcon } from '@phosphor-icons/react';

export interface TaskStyle {
  accent: string;
  labelBg: string;
  avatarBg: string;
  dotBg: string;
  btnBg: string;
  icon: ReactNode;
}

export function getTaskStyles(type: 'CONSULTATION' | 'EXAMINATION' | 'RESULTS_READY'): TaskStyle {
  const styles = {
    CONSULTATION: {
      accent: '#185FA5',
      labelBg: 'bg-[#E6F1FB] text-[#0C447C] border-[#B5D4F4]',
      avatarBg: 'bg-[#E6F1FB] text-[#0C447C] border-[#B5D4F4]',
      dotBg: 'bg-[#FAC775]',
      btnBg: 'bg-gradient-to-b from-[#1f6db5] to-[#155b9d] text-white shadow-[#1560a8]/24 hover:from-[#1a63a6] hover:to-[#0f4c85]',
      icon: <ClipboardTextIcon size={12} weight="bold" />,
    },
    EXAMINATION: {
      accent: '#7F77DD',
      labelBg: 'bg-[#EEEDFE] text-[#3C3489] border-[#CECBF6]',
      avatarBg: 'bg-[#EEEDFE] text-[#3C3489] border-[#CECBF6]',
      dotBg: 'bg-[#7F77DD]',
      btnBg: 'bg-gradient-to-b from-[#5f56c3] to-[#4e45b0] text-white shadow-[#534ab7]/24 hover:from-[#564db8] hover:to-[#433aa5]',
      icon: <QueueIcon size={12} weight="bold" />,
    },
    RESULTS_READY: {
      accent: '#1D9E75',
      labelBg: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
      avatarBg: 'bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]',
      dotBg: 'bg-[#22c55e]',
      btnBg: 'bg-gradient-to-b from-[#138063] to-[#0d6a51] text-white shadow-[#0d6e56]/22 hover:from-[#0f7359] hover:to-[#095b46]',
      icon: <ArrowRightIcon size={12} weight="bold" />,
    },
  };
  return styles[type];
}
