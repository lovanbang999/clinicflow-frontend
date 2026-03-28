'use client';

import { useTranslations } from 'next-intl';
import { CircleNotchIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { DoctorTableRow } from './DoctorTableRow';
import { DoctorTableToolbar } from './DoctorTableToolbar';
import { type Doctor, type DoctorStatus, type Specialty } from './types';

const COLUMNS = ['doctor', 'specialty', 'experience', 'status', 'action'] as const;

type Props = {
  doctors: Doctor[];
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  selectedSpecialties: Set<Specialty>;
  selectedStatuses: Set<DoctorStatus>;
  onToggleSpecialty: (sp: Specialty) => void;
  onToggleStatus: (st: DoctorStatus) => void;
  onClearFilters: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAddDoctor: () => void;
  onEdit?: (doctor: Doctor) => void;
  onMore?: (doctor: Doctor, buttonRef: React.RefObject<HTMLButtonElement | null>) => void;
};

export function DoctorTable({
  doctors,
  totalCount,
  page,
  totalPages,
  isLoading,
  selectedSpecialties,
  selectedStatuses,
  onToggleSpecialty,
  onToggleStatus,
  onClearFilters,
  onPrevPage,
  onNextPage,
  onAddDoctor,
  onEdit,
  onMore,
}: Props) {
  const t = useTranslations('dashboard.admin.doctorManagement');
  const limit = 10;
  const from = doctors.length > 0 ? (page - 1) * limit + 1 : 0;
  const to = (page - 1) * limit + doctors.length;

  return (
    <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-sm overflow-hidden flex flex-col relative min-h-100">
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
          <CircleNotchIcon size={32} className="text-[#1392ec] animate-spin" />
        </div>
      )}

      {/* Toolbar */}
      <DoctorTableToolbar
        selectedSpecialties={selectedSpecialties}
        selectedStatuses={selectedStatuses}
        onToggleSpecialty={onToggleSpecialty}
        onToggleStatus={onToggleStatus}
        onClearFilters={onClearFilters}
        onAddDoctor={onAddDoctor}
      />

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e5e7eb]">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className={cn(
                    'px-6 py-4 text-xs font-bold text-[#64748b] uppercase tracking-wider',
                    col === 'action' && 'text-right',
                  )}
                >
                  {t(`table.columns.${col}`)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e5e7eb]">
            {doctors.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-[#94a3b8] text-sm">
                  {t('table.empty')}
                </td>
              </tr>
            ) : (
              doctors.map((doctor) => (
                <DoctorTableRow
                  key={doctor.id}
                  doctor={doctor}
                  onEdit={onEdit}
                  onMore={onMore}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#e5e7eb] flex items-center justify-between">
        <p className="text-xs text-[#64748b] font-medium">
          {t('table.showing')}{' '}
          <span className="text-[#111518] font-bold">
            {doctors.length > 0 ? `${from}-${to}` : '0'}
          </span>{' '}
          {t('table.of')}{' '}
          <span className="text-[#111518] font-bold">{totalCount}</span>{' '}
          {t('table.doctors')}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={onPrevPage}
            className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#64748b] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CaretLeftIcon size={12} weight="bold" />
            {t('table.previous')}
          </button>
          <button
            disabled={page >= totalPages}
            onClick={onNextPage}
            className="flex items-center gap-1 px-3 py-1.5 border border-[#e5e7eb] rounded-lg text-xs font-medium text-[#111518] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {t('table.next')}
            <CaretRightIcon size={12} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
}
