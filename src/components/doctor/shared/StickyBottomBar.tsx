import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface StickyBottomBarProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export function StickyBottomBar({ title, children, className }: StickyBottomBarProps) {
  return (
    <div className={cn(
      "sticky bottom-0 -mx-6 px-6 py-3.5 bg-white border-t border-gray-200 flex items-center justify-between z-[99] shadow-[0_-8px_16px_rgba(0,0,0,0.03)] mt-8",
      className
    )}>
      <div className="text-[13px] text-gray-500 font-medium tracking-wide">
        {title}
      </div>
      {children}
    </div>
  );
}
