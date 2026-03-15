'use client';

import { cn } from '@/lib/utils';

interface Step {
  number: number;
  label: string;
}

interface BookingStepsProps {
  steps: Step[];
  currentStep: number;
}

export function BookingSteps({ steps, currentStep }: BookingStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;
          const isUpcoming = currentStep < step.number;

          return (
            <div key={step.number} className="relative flex flex-col items-center group flex-1">
              {/* Connector line overlay */}
              {idx < steps.length - 1 && (
                <>
                  {/* Background line (gray) */}
                  <div className="absolute top-6 left-1/2 w-full h-0.5 bg-slate-100 dark:bg-slate-800 z-0" />
                  {/* Active line (blue) */}
                  <div 
                    className={cn(
                      "absolute top-6 left-1/2 h-0.5 z-0 transition-all duration-500",
                      currentStep > step.number ? "bg-blue-500 w-full" : "bg-transparent w-0"
                    )} 
                  />
                </>
              )}

              {/* Circle */}
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-base font-bold transition-all duration-300 mb-4 relative z-10',
                  isCurrent && 'bg-blue-500 text-white shadow-xl shadow-blue-500/30 scale-110',
                  isCompleted && 'bg-blue-500 text-white',
                  isUpcoming && 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600'
                )}
              >
                {step.number}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] sm:text-xs md:text-sm md:font-bold font-semibold transition-colors duration-300 text-center mt-2 max-w-[60px] md:max-w-none leading-tight md:leading-normal',
                  isCurrent ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
