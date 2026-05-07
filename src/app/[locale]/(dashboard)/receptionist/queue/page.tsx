'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { QueueBoard } from '@/components/queue/QueueBoard';
import { DoctorQueueSelector } from '@/components/queue/DoctorQueueSelector';
import { UsersThreeIcon } from '@phosphor-icons/react';

export default function ReceptionistQueuePage() {
  const t = useTranslations('receptionistQueue.queueManagement');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedDoctorName, setSelectedDoctorName] = useState<string | undefined>();

  const handleDoctorSelect = (doctorId: string, doctorName: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedDoctorName(doctorName);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">

      {/* Page header */}
      <div className="px-6 pt-5 pb-4 shrink-0 flex items-center justify-between border-b border-slate-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <UsersThreeIcon size={20} weight="fill" className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{t('title')}</h1>
            <p className="text-xs text-slate-400 font-medium">{t('overview')}</p>
          </div>
        </div>

        {selectedDoctorId && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 animate-in fade-in duration-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-700 max-w-48 truncate">
              {selectedDoctorName}
            </span>
          </div>
        )}
      </div>

      {/* Body: sidebar + board */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Doctor Sidebar — wider for readability */}
        <div className="w-80 shrink-0 flex flex-col border-r border-slate-100 bg-slate-50/40">
          {/* Sidebar label */}
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {t('chooseDoctor')}
            </p>
          </div>

          <div className="flex-1 overflow-hidden p-3">
            <DoctorQueueSelector
              onSelect={handleDoctorSelect}
              selectedDoctorId={selectedDoctorId}
            />
          </div>
        </div>

        {/* RIGHT: Queue Board */}
        <div className="flex-1 overflow-y-auto p-6">
          <QueueBoard
            doctorId={selectedDoctorId}
            doctorName={selectedDoctorName}
            isDoctorView={false}
          />
        </div>

      </div>
    </div>
  );
}
