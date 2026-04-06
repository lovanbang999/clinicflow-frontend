'use client';

import React from 'react';

interface DetailSectionCardProps {
  title: string;
  children: React.ReactNode;
}

export function DetailSectionCard({ title, children }: DetailSectionCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800/50">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-4 divide-y divide-slate-50 dark:divide-slate-800/50">{children}</div>
    </div>
  );
}

interface DetailInfoRowProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
  bgColor?: string;
}

export function DetailInfoRow({
  icon: Icon,
  label,
  value,
  iconColor = 'text-slate-500 dark:text-slate-400',
  bgColor = 'bg-slate-100 dark:bg-slate-800',
}: DetailInfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={16} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-0.5">{label}</p>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">{value}</div>
      </div>
    </div>
  );
}
