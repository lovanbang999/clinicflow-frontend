'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import {
  PencilSimpleIcon,
  DotsThreeVerticalIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { SPECIALTY_STYLES, STATUS_STYLES, type Doctor } from './types';
import { BackendUser } from '@/types';
import { getInitials } from '@/lib/utils/helpers';

type Props = {
  doctor: Doctor;
  backendDoctor?: BackendUser;
  onEdit?: (doctor: Doctor) => void;
  onMore?: (doctor: Doctor, buttonRef: React.RefObject<HTMLButtonElement | null>) => void;
};

export function DoctorTableRow({ doctor, onEdit, onMore }: Props) {
  const t = useTranslations('adminDoctors');
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);

  const statusStyles = STATUS_STYLES[doctor.status];
  const specialtyStyle =
    SPECIALTY_STYLES[doctor.specialty] ?? 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <tr className="group hover:bg-blue-50/30 transition-colors">
      {/* Doctor info */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          {doctor.avatar ? (
            <div
              className="size-10 rounded-full bg-cover bg-center shrink-0 border border-[#e5e7eb]"
              style={{ backgroundImage: `url("${doctor.avatar}")` }}
            />
          ) : (
            <div className="size-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 bg-blue-100 text-blue-600 border-blue-200">
              {getInitials(doctor.fullName)}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-[#111518]">{doctor.fullName}</p>
            <p className="text-xs text-[#64748b]">{doctor.email}</p>
          </div>
        </div>
      </td>

      {/* Specialty */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border w-max',
              specialtyStyle,
            )}
          >
            {(() => {
              try {
                const specialties = t.raw('specialties');
                return specialties[doctor.specialty] || doctor.specialty;
              } catch {
                return doctor.specialty;
              }
            })()}
          </span>
          {doctor.roomName && (
            <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
              🏢 {doctor.roomName}
            </span>
          )}
        </div>
      </td>

      {/* Experience */}
      <td className="px-6 py-4 whitespace-nowrap">
        <p className="text-sm font-medium text-[#111518]">
          {t('table.years', { count: doctor.experience })}
        </p>
      </td>

      {/* Fee */}
      <td className="px-6 py-4 whitespace-nowrap">
        {doctor.consultationFee && doctor.consultationFee > 0 ? (
          <p className="text-sm font-bold text-blue-600">
            {new Intl.NumberFormat('vi-VN').format(doctor.consultationFee)} <span className="text-[10px] text-slate-400">{t('currency')}</span>
          </p>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
            {t('table.free')}
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border',
            statusStyles.wrapper,
          )}
        >
          <span className={cn('size-1.5 rounded-full', statusStyles.dot)} />
          {t(`table.statuses.${doctor.status}`)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title={t('table.actions.edit')}
            onClick={() => onEdit?.(doctor)}
            className="p-2 text-[#64748b] hover:text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg transition-colors cursor-pointer"
          >
            <PencilSimpleIcon size={20} />
          </button>
          <button
            ref={moreButtonRef}
            title={t('table.actions.more')}
            onClick={() => onMore?.(doctor, moreButtonRef)}
            className="p-2 text-[#64748b] hover:text-[#1392ec] hover:bg-[#1392ec]/10 rounded-lg transition-colors cursor-pointer"
          >
            <DotsThreeVerticalIcon size={20} weight="bold" />
          </button>
        </div>
      </td>
    </tr>
  );
}
