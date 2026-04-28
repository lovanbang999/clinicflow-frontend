'use client';

import { useDoctors } from '@/lib/hooks/clinical/useDoctors';
import { cn } from '@/lib/utils';
import { CheckCircleIcon } from '@phosphor-icons/react';

interface DoctorQueueSelectorProps {
  onSelect: (doctorId: string, doctorName: string) => void;
  selectedDoctorId?: string;
}

export function DoctorQueueSelector({ onSelect, selectedDoctorId }: DoctorQueueSelectorProps) {
  const { doctors } = useDoctors();

  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap pb-2">
      {doctors.map((doctor) => {
        const isSelected = selectedDoctorId === doctor.id;
        return (
          <button
            key={doctor.id}
            onClick={() => onSelect(doctor.id, doctor.fullName)}
            className={cn(
              "group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-300 shrink-0 cursor-pointer overflow-hidden",
              isSelected 
                ? "bg-slate-900 border-slate-900 shadow-md transform scale-[1.02]" 
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm hover:bg-slate-50"
            )}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-50" />
            )}
            <div className={cn(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors",
                isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
            )}>
              {doctor.fullName.charAt(0)}
            </div>
            <span className={cn(
              "relative z-10 font-medium text-sm whitespace-nowrap transition-colors",
              isSelected ? "text-white font-semibold" : "text-slate-700"
            )}>
              {doctor.fullName}
            </span>
            {isSelected && (
              <CheckCircleIcon size={18} weight="fill" className="relative z-10 text-white ml-1 animate-in zoom-in duration-300" />
            )}
          </button>
        );
      })}
    </div>
  );
}
