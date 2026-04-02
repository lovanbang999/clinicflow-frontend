'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  EyeIcon,
  PencilSimpleIcon,
} from '@phosphor-icons/react';
import { getInitials } from '@/lib/utils/helpers';
import { User } from '@/types';

type PatientTableProps = {
  patients: User[];
  loading?: boolean;
  onView?: (patient: User) => void;
  onEdit?: (patient: User) => void;
};

export function PatientTable({
  patients,
  loading,
  onView,
  onEdit,
}: PatientTableProps) {
  const t = useTranslations('receptionistPatients');

  const columns = [
    t('table.patient'),
    t('table.code'),
    t('table.contact'),
    t('table.gender'),
    t('table.status'),
    t('table.actions'),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#f6f7f8]/70">
            {columns.map((col, i) => (
              <th
                key={col}
                className={`px-4 py-3.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider whitespace-nowrap ${
                  i === columns.length - 1 ? 'text-right' : ''
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f3f4]">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-slate-200 shrink-0" />
                    <div className="h-4 bg-slate-200 rounded w-28" />
                  </div>
                </td>
                {Array.from({ length: 4 }).map((_, j) => (
                  <td key={j} className="px-4 py-4">
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </td>
                ))}
                <td className="px-4 py-4">
                  <div className="h-4 bg-slate-200 rounded w-24 ml-auto" />
                </td>
              </tr>
            ))
          ) : patients.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-16 text-center text-sm text-[#94a3b8]"
              >
                {t('table.empty') ?? 'Không tìm thấy bệnh nhân nào'}
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
                        <div className="size-9 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 bg-blue-50 text-blue-600 border-blue-100 uppercase">
                          {getInitials(patient.fullName)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block font-medium text-[#111518] text-sm whitespace-nowrap">
                        {patient.fullName}
                      </span>
                      {patient.patientProfile?.isGuest && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {t('table.guest') ?? 'Vãng lai'}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Code */}
                <td className="px-4 py-4 text-sm text-[#64748b] font-mono whitespace-nowrap">
                  {patient.patientProfile?.patientCode || '—'}
                </td>

                {/* Contact */}
                <td className="px-4 py-4">
                  <div className="text-sm text-[#111518]">{patient.phone || '—'}</div>
                  <div className="text-xs text-[#64748b] truncate max-w-[150px]">
                    {patient.email || '—'}
                  </div>
                </td>

                {/* Gender */}
                <td className="px-4 py-4 text-sm text-[#64748b]">
                  {patient.gender || '—'}
                </td>

                {/* Status */}
                <td className="px-4 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    patient.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {patient.isActive ? (t('table.statusActive') ?? 'Hoạt động') : (t('table.statusInactive') ?? 'Tạm khóa')}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center opacity-0 group-hover:opacity-100 justify-end gap-1 transition-opacity">
                    <button
                      onClick={() => onView?.(patient)}
                      className="p-1.5 text-[#94a3b8] hover:text-[#1392ec] transition-colors rounded-lg hover:bg-[#1392ec]/10 cursor-pointer"
                      title={t('actions.viewDetail')}
                    >
                      <EyeIcon size={18} />
                    </button>
                    <button
                      onClick={() => onEdit?.(patient)}
                      className="p-1.5 text-[#94a3b8] hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50 cursor-pointer"
                      title={t('actions.edit')}
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
