'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { WarningCircleIcon } from '@phosphor-icons/react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
  description?: string;
}

export function FormField({
  label,
  required = false,
  error,
  children,
  className,
  description,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2 flex flex-col w-full group", className)}>
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        
        {error && (
          <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1 animate-in fade-in slide-in-from-right-1">
            <WarningCircleIcon weight="fill" size={12} />
            {error}
          </span>
        )}
      </div>

      <div className="relative">
        {children}
      </div>

      {description && !error && (
        <p className="px-1 text-[10px] font-medium text-slate-400 italic">
          {description}
        </p>
      )}
    </div>
  );
}
