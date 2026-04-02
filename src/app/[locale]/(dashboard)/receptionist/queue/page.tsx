'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { QueueBoard } from '@/components/queue/QueueBoard';
import { DoctorQueueSelector } from '@/components/queue/DoctorQueueSelector';

export default function ReceptionistQueuePage() {
  const t = useTranslations('receptionistQueue.queueManagement');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedDoctorName, setSelectedDoctorName] = useState<string | undefined>();

  const handleDoctorSelect = (doctorId: string, doctorName: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedDoctorName(doctorName);
  };

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {t('title')}
        </h1>
        <p className="text-slate-500 font-medium">{t('overview')}</p>
      </div>

      {/* Doctor Selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('chooseDoctor')}</h3>
        <DoctorQueueSelector 
          onSelect={handleDoctorSelect} 
          selectedDoctorId={selectedDoctorId} 
        />
      </div>

      {/* Main Board */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <QueueBoard 
          doctorId={selectedDoctorId} 
          doctorName={selectedDoctorName} 
          isDoctorView={false} // Receptionist can view but not "call" 
        />
      </div>
    </div>
  );
}
