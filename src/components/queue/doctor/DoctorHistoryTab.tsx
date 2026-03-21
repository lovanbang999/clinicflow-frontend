'use client';

import { useTranslations } from 'next-intl';
import {
  ClockCounterClockwiseIcon,
  SpinnerIcon,
  FileMagnifyingGlassIcon,
  StethoscopeIcon,
} from '@phosphor-icons/react';
import { format } from 'date-fns';
import type { PatientHistoryResponse } from '@/lib/api/medical-records';

interface DoctorHistoryTabProps {
  history: PatientHistoryResponse | null;
  isLoading: boolean;
}

export function DoctorHistoryTab({ history, isLoading }: DoctorHistoryTabProps) {
  const t = useTranslations('dashboard.doctor.workspace.historyTab');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500 bg-white border border-gray-100 shadow-sm rounded-xl">
        <SpinnerIcon size={32} className="animate-spin text-blue-600" />
        <span className="text-sm font-medium">{t('loading')}</span>
      </div>
    );
  }

  if (!history || history.recentVisits.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-16 flex flex-col items-center justify-center gap-3 text-gray-500">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100/80 mb-2">
          <FileMagnifyingGlassIcon size={32} className="text-gray-400" />
        </div>
        <span className="text-sm font-medium">{t('empty')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-50/80 text-blue-600 flex items-center justify-center rounded-full">
          <ClockCounterClockwiseIcon size={18} weight="fill" />
        </div>
        <h3 className="text-[15px] font-bold text-gray-900">
          {t('title', { count: history.recentVisits.length })}
        </h3>
      </div>

      {/* Visit list */}
      <div className="divide-y divide-gray-100">
        {history.recentVisits.map((visit) => {
          const diagnosisName = visit.medicalRecord?.diagnosisName ?? null;
          const dateStr = format(new Date(visit.bookingDate), 'dd/MM/yyyy');

          return (
            <div
              key={visit.bookingId}
              className="flex items-center gap-5 px-6 py-5 hover:bg-gray-50/50 transition-colors"
            >
              {/* Date Column */}
              <div className="flex flex-col items-center justify-center px-3 py-2.5 bg-gray-50/80 rounded-xl border border-gray-100/60 w-[84px] shrink-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 text-center leading-tight">Ngày<br/>Khám</span>
                <span className="text-[13px] font-bold text-gray-900">{dateStr}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold text-gray-900 truncate mb-1.5">
                  {diagnosisName ?? t('noRecord')}
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <StethoscopeIcon size={16} className="text-gray-400" />
                  <span className="truncate leading-none">{visit.serviceName}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 pl-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                  {t('completed')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
