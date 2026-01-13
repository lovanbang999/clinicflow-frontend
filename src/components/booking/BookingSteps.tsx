'use client';

import { Check } from 'lucide-react';
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
    <div className="w-full py-6">
      <div className="flex items-start">
        {steps.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          // Connector coloring
          const leftActive = currentStep >= step.number; // reached this step
          const rightActive = currentStep > step.number; // passed this step

          const isFirst = idx === 0;
          const isLast = idx === steps.length - 1;

          return (
            <div key={step.number} className="relative flex-1">
              {/* Connectors (behind circle) */}
              {!isFirst && (
                <div
                  className={cn(
                    'absolute left-0 top-6 h-1 w-1/2 -translate-y-1/2 rounded-full',
                    leftActive ? 'bg-primary' : 'bg-gray-200'
                  )}
                />
              )}
              {!isLast && (
                <div
                  className={cn(
                    'absolute -right-10 top-6 h-1 w-2/3 -translate-y-1/2 rounded-full',
                    rightActive ? 'bg-primary' : 'bg-gray-200'
                  )}
                />
              )}

              {/* Step content */}
              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Circle */}
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold transition-all',
                    isCompleted && 'bg-green-500 text-white shadow-md',
                    isCurrent && 'bg-primary text-white shadow-md',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-600'
                  )}
                >
                  {isCompleted ? <Check className="h-6 w-6" /> : step.number}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-center text-sm font-medium transition-colors',
                    (isCompleted || isCurrent) && 'text-gray-900',
                    !isCompleted && !isCurrent && 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
