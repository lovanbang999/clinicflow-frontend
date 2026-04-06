'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  EyeIcon,
  ClipboardTextIcon,
  CalendarPlusIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { getInitials } from '@/lib/utils/helpers';

export type PatientRow = {
  id: string;
  fullName: string;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  phone?: string | null;
  bloodType?: string | null;
  lastVisit?: string | null;
  nextAppointment?: string | null;
  assignedDoctor?: string | null;
  isActive: boolean;
  status?: 'active' | 'inactive' | 'pending';
};

type PatientTableProps = {
  patients: PatientRow[];
  loading?: boolean;
  onViewProfile?: (patient: PatientRow) => void;
  onMedicalHistory?: (patient: PatientRow) => void;
  onBookAppointment?: (patient: PatientRow) => void;
  onEdit?: (patient: PatientRow) => void;
};

function StatusBadge({
  status,
  isActive,
  t,
}: {
  status?: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  t: (key: string) => string;
}) {
  const resolved = status ?? (isActive ? 'active' : 'inactive');

  const styles: Record<string, string> = {
    active:
      'bg-emerald-50 text-emerald-700 border border-emerald-100',
    inactive:
      'bg-slate-100 text-slate-500 border border-slate-200',
    pending:
      'bg-amber-50 text-amber-700 border border-amber-100',
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[resolved]}`}
    >
      {t(`table.statuses.${resolved}`)}
    </span>
  );
}

export function PatientTable({
  patients,
  loading,
  onViewProfile,
  onMedicalHistory,
  onBookAppointment,
  onEdit,
}: PatientTableProps) {
  const t = useTranslations('adminPatients');

  const columns = [
    t('table.columns.patient'),
    t('table.columns.dob'),
    t('table.columns.gender'),
    t('table.columns.phone'),
    t('table.columns.blood'),
    t('table.columns.lastVisit'),
    t('table.columns.nextAppt'),
    t('table.columns.doctor'),
    t('table.columns.status'),
    t('table.columns.actions'),
  ];

  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#f6f7f8]/70">
            {columns.map((col, i) => (
              <th
                key={col}
                className={`px-4 py-3.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider whitespace-nowrap ${i === columns.length - 1 ? 'text-right' : ''
                  }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f3f4]">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-4 bg-slate-200 rounded w-28" />
                  </div>
                </td>
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </td>
                ))}
                <td className="px-4 py-4">
                  <div className="h-4 bg-slate-200 rounded w-28 ml-auto" />
                </td>
              </tr>
            ))
          ) : patients.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-sm text-[#94a3b8]"
              >
                {t('table.empty')}
              </td>
            </tr>
          ) : (
            patients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-[#f6f7f8]/50 transition-colors group"
              >
                {/* Patient */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                      {patient.avatar ? (
                        <Image
                          src={patient.avatar}
                          alt={patient.fullName}
                          width={36}
                          height={36}
                          className="object-cover size-full"
                        />
                      ) : (
                        <div className="size-10 rounded-full flex items-center justify-center font-bold text-sm border shrink-0 bg-blue-100 text-blue-600 border-blue-200">
                          {getInitials(patient.fullName)}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-[#111518] text-sm whitespace-nowrap">
                      {patient.fullName}
                    </span>
                  </div>
                </td>

                {/* DOB */}
                <td className="px-4 py-4 text-sm text-[#64748b] whitespace-nowrap">
                  {patient.dateOfBirth ?? '—'}
                </td>

                {/* Gender */}
                <td className="px-4 py-4 text-sm text-[#64748b]">
                  {patient.gender ?? '—'}
                </td>

                {/* Phone */}
                <td className="px-4 py-4 text-sm text-[#64748b] whitespace-nowrap">
                  {patient.phone ?? '—'}
                </td>

                {/* Blood type */}
                <td className="px-4 py-4 text-sm text-[#64748b]">
                  {patient.bloodType ?? '—'}
                </td>

                {/* Last visit */}
                <td className="px-4 py-4 text-sm text-[#64748b] whitespace-nowrap">
                  {patient.lastVisit ?? '—'}
                </td>

                {/* Next appointment */}
                <td className="px-4 py-4 text-sm text-[#64748b] whitespace-nowrap">
                  {patient.nextAppointment ?? '—'}
                </td>

                {/* Doctor */}
                <td className="px-4 py-4 text-sm text-[#64748b] whitespace-nowrap">
                  {patient.assignedDoctor ?? '—'}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <StatusBadge
                    status={patient.status}
                    isActive={patient.isActive}
                    t={t}
                  />
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center opacity-0 group-hover:opacity-100 justify-end gap-0.5">
                    <button
                      onClick={() => onViewProfile?.(patient)}
                      title={t('table.actions.viewProfile')}
                      className="p-1.5 text-[#94a3b8] hover:text-[#1392ec] transition-colors rounded-lg hover:bg-[#1392ec]/10 cursor-pointer"
                    >
                      <EyeIcon size={18} />
                    </button>
                    <button
                      onClick={() => onMedicalHistory?.(patient)}
                      title={t('table.actions.medicalHistory')}
                      className="p-1.5 text-[#94a3b8] hover:text-[#1392ec] transition-colors rounded-lg hover:bg-[#1392ec]/10 cursor-pointer"
                    >
                      <ClipboardTextIcon size={18} />
                    </button>
                    <button
                      onClick={() => onBookAppointment?.(patient)}
                      title={t('table.actions.bookAppointment')}
                      className="p-1.5 text-[#94a3b8] hover:text-[#1392ec] transition-colors rounded-lg hover:bg-[#1392ec]/10 cursor-pointer"
                    >
                      <CalendarPlusIcon size={18} />
                    </button>
                    <button
                      onClick={() => onEdit?.(patient)}
                      title={t('table.actions.edit')}
                      className="p-1.5 text-[#94a3b8] hover:text-[#1392ec] transition-colors rounded-lg hover:bg-[#1392ec]/10 cursor-pointer"
                    >
                      <PencilSimpleIcon size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
