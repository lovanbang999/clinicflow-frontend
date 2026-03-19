'use client';

import { useDoctors } from '@/lib/hooks/useDoctors';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@phosphor-icons/react';

interface DoctorQueueSelectorProps {
  onSelect: (doctorId: string, doctorName: string) => void;
  selectedDoctorId?: string;
}

export function DoctorQueueSelector({ onSelect, selectedDoctorId }: DoctorQueueSelectorProps) {
  const { doctors } = useDoctors();

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {doctors.map((doctor) => {
        const isSelected = selectedDoctorId === doctor.id;
        return (
          <button
            key={doctor.id}
            onClick={() => onSelect(doctor.id, doctor.fullName)}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all shrink-0 cursor-pointer",
              isSelected 
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:bg-slate-50"
            )}
          >
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
            )}>
              {doctor.fullName.charAt(0)}
            </div>
            <span className="font-bold text-sm whitespace-nowrap">{doctor.fullName}</span>
            {isSelected && <CheckIcon size={16} weight="bold" />}
          </button>
        );
      })}
    </div>
  );
}
