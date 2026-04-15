'use client';

import { cn } from '@/lib/utils';
import { CheckCircleIcon } from '@phosphor-icons/react';

interface BillingStepTrackProps {
  currentStep: string; // 'B1', 'B3', 'B8'
}

export function BillingStepTrack({ currentStep }: BillingStepTrackProps) {
  const steps = [
    { id: 'B1', label: 'Khám tư vấn', detail: 'Thu phí khám' },
    { id: 'B3', label: 'Dịch vụ CLS', detail: 'Thu phí chỉ định' },
    { id: 'B8', label: 'Hoàn tất/Thuốc', detail: 'Mua thuốc (tùy chọn)' },
  ];

  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto px-4 py-8">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        
        return (
          <div key={step.id} className="flex flex-col items-center relative flex-1">
            {/* connector line */}
            {idx < steps.length - 1 && (
              <div 
                className={cn(
                  "absolute h-0.5 w-[calc(100%-2rem)] left-[calc(50%+1rem)] top-4 -z-10",
                  idx < currentIdx ? "bg-emerald-500" : "bg-slate-200"
                )}
              />
            )}

            <div 
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                isCurrent ? "bg-white border-[#1392ec] text-[#1392ec] ring-4 ring-[#1392ec]/10 shadow-sm" :
                "bg-white border-slate-200 text-slate-300"
              )}
            >
              {isCompleted ? <CheckCircleIcon size={20} weight="bold" /> : <span className="text-xs font-bold">{idx + 1}</span>}
            </div>
            
            <div className="mt-2 text-center">
              <p className={cn(
                "text-[11px] font-bold uppercase tracking-wider mb-0.5",
                isCurrent ? "text-[#1392ec]" : isCompleted ? "text-emerald-600" : "text-slate-400"
              )}>
                {step.id}
              </p>
              <p className={cn(
                "text-xs font-semibold",
                isCurrent ? "text-slate-800" : "text-slate-500"
              )}>
                {step.label}
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                {step.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
