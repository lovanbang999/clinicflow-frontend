'use client';

import { useTranslations } from 'next-intl';
import { 
  MagnifyingGlassIcon, 
  ArrowsClockwiseIcon 
} from '@phosphor-icons/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WorklistSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function WorklistSearchBar({
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading
}: WorklistSearchBarProps) {
  const t = useTranslations('technicianWorklist.worklist');

  return (
    <div className="shrink-0 flex items-center gap-2">
      <div className="relative w-72">
        <MagnifyingGlassIcon size={18} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          type="text"
          placeholder={t('searchPlaceholder')}
          className="pl-9 h-10 rounded-xl border-slate-200 bg-white text-xs focus-visible:ring-[#1392ec]/20"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Button
        onClick={onRefresh}
        disabled={isLoading}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-xl border-slate-200 bg-white text-slate-500 hover:text-[#1392ec] hover:border-[#1392ec]/30 cursor-pointer"
      >
        <ArrowsClockwiseIcon 
          size={18} 
          weight="bold" 
          className={isLoading ? "animate-spin" : ""} 
        />
      </Button>
    </div>
  );
}
