import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  accentColor?: string;
}

export function FormSection({ 
  title, 
  icon, 
  children, 
  className,
  accentColor = "bg-blue-500"
}: FormSectionProps) {
  return (
    <div className={cn("bg-white rounded-[32px] border border-slate-200 p-8 space-y-6", className)}>
      <div className="flex items-center gap-3 mb-2">
        <div className={cn("w-1.5 h-5 rounded-full", accentColor)} />
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-500">{icon}</span>}
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
        </div>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
