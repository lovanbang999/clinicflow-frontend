'use client';

import { useTranslations } from 'next-intl';
import { 
  MagnifyingGlassIcon, 
  ArrowsClockwiseIcon 
} from '@phosphor-icons/react';

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
    <div className="pb-4 shrink-0 flex items-center justify-between gap-4">
      <div className="flex items-center bg-white border border-[#e5e7eb] rounded-xl px-3 py-2 w-full max-w-sm focus-within:ring-2 ring-[#1392ec]/20 transition-all">
        <MagnifyingGlassIcon size={20} weight="bold" className="text-[#64748b]" />
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          className="flex-1 ml-2 bg-transparent outline-none text-sm text-[#111518]"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <button 
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e7eb] rounded-xl text-[#64748b] hover:text-[#1392ec] hover:border-[#1392ec]/30 transition-all font-medium text-sm disabled:opacity-50 cursor-pointer"
      >
        <ArrowsClockwiseIcon 
          size={18} 
          weight="bold" 
          className={isLoading ? "animate-spin" : ""} 
        />
      </button>
    </div>
  );
}
