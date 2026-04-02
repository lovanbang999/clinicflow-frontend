'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { User } from '@/types';
import { UserIcon, CheckCircleIcon, PhoneCallIcon, CalendarBlankIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../../WalkinBookingContext';

interface PatientCardProps {
  patient: User;
}

export function PatientCard({ patient }: PatientCardProps) {
  const t = useTranslations('receptionistWalkinBooking.patient');
  const { selectPatient } = useWalkinBooking();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-4 shadow-sm transition-shadow hover:shadow-md group">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-transparent group-hover:ring-[#1570EF]/10 transition-all">
        {patient.avatar ? (
          <Image src={patient.avatar} alt={patient.fullName} width={48} height={48} className="object-cover" />
        ) : (
          <UserIcon size={24} className="text-slate-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold text-[#1570EF] bg-[#EFF4FF] px-2 py-0.5 rounded-md uppercase">
            ID: {patient.patientProfile?.patientCode || patient.id.slice(0, 6).toUpperCase()}
          </span>
          <h4 className="font-bold text-slate-900 truncate">{patient.fullName}</h4>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <PhoneCallIcon size={14} className="text-slate-400" /> {patient.phone}
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <CalendarBlankIcon size={14} className="text-slate-400" /> {t('age', { age: 34 })}
          </div>
        </div>
      </div>
      <button
        onClick={() => selectPatient(patient)}
        className="h-9 px-4 bg-[#1570EF] text-white rounded-lg text-sm font-bold hover:bg-[#0F5ED4] transition-all shadow-sm active:scale-[0.97] flex items-center gap-1.5 cursor-pointer"
      >
        <CheckCircleIcon size={16} weight="bold" /> {t('selectBtn')}
      </button>
    </div>
  );
}
