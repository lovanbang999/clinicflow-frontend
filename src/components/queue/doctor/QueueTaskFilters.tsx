'use client';

import { useTranslations } from 'next-intl';

export type TaskTypeFilter = 'ALL' | 'CONSULTATION' | 'EXAMINATION';

interface QueueTaskFiltersProps {
  active: TaskTypeFilter;
  onChange: (id: TaskTypeFilter) => void;
}

export function QueueTaskFilters({ active, onChange }: QueueTaskFiltersProps) {
  const t = useTranslations('doctorWorkspace.queueView');
  const filters = [
    { id: 'ALL', label: t('filters.all', { defaultMessage: 'All' }) },
    { id: 'CONSULTATION', label: t('filters.consult', { defaultMessage: 'Consultation' }), color: '#185FA5' },
    { id: 'EXAMINATION', label: t('filters.exam', { defaultMessage: 'Examination' }), color: '#7F77DD' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-[#f3f4f9] rounded-xl border border-[#e2e2e9]">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id as TaskTypeFilter)}
          className={`cursor-pointer px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${active === f.id ? 'bg-white shadow-sm text-[#191c20] border border-[#e2e2e9]' : 'text-[#44474e] hover:bg-white/30'
            }`}
        >
          {f.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />}
          {f.label}
        </button>
      ))}
    </div>
  );
}
