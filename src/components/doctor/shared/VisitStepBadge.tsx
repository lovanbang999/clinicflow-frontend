'use client';

import { useTranslations } from 'next-intl';
import type { VisitStep } from '@/lib/api/clinical/medical-records';
import { cn } from '@/lib/utils';

const STEP_CONFIG: Record<VisitStep, { labelKey: string; color: string }> = {
  SYMPTOMS_TAKEN:   { labelKey: 'visitSteps.SYMPTOMS_TAKEN', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  SERVICES_ORDERED: { labelKey: 'visitSteps.SERVICES_ORDERED', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  AWAITING_RESULTS: { labelKey: 'visitSteps.AWAITING_RESULTS', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  RESULTS_READY:    { labelKey: 'visitSteps.RESULTS_READY', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  DIAGNOSED:        { labelKey: 'visitSteps.DIAGNOSED', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  PRESCRIBED:       { labelKey: 'visitSteps.PRESCRIBED', color: 'bg-green-100 text-green-700 border-green-200' },
  COMPLETED:        { labelKey: 'visitSteps.COMPLETED', color: 'bg-green-200 text-green-800 border-green-300' },
};

interface VisitStepBadgeProps {
  step: VisitStep;
  className?: string;
  size?: 'sm' | 'md';
}

export function VisitStepBadge({ step, className, size = 'sm' }: VisitStepBadgeProps) {
  const t = useTranslations('doctorWorkspace.visit');
  const config = STEP_CONFIG[step] ?? { labelKey: '', color: 'bg-gray-100 text-gray-600 border-gray-200' };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.color,
        className,
      )}
    >
      {config.labelKey ? t(config.labelKey) : step}
    </span>
  );
}
