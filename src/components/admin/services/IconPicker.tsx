'use client';

import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';

interface IconPickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// Move icon discovery outside to avoid React Compiler issues and re-running on every render
const allLucideIcons: string[] = (() => {
  try {
    const iconsObj = Icons as unknown as Record<string, unknown>;
    const source = (iconsObj.default as Record<string, unknown>) || iconsObj;
    const keys = Object.keys(source);
    
    const detected = keys.filter((name) => 
      typeof source[name] === 'function' && 
      name !== 'createLucideIcon' &&
      /^[A-Z]/.test(name)
    );

    if (detected.length > 0) return detected;
  } catch (e) {
    console.error('Error detecting icons:', e);
  }

  // Fallback list of common icons
  return [
    'Search', 'Plus', 'User', 'Settings', 'Check', 'X', 'Bell', 'Calendar', 
    'Clock', 'FileText', 'Home', 'Info', 'Mail', 'Menu', 'Package', 'Phone', 
    'Printer', 'RefreshCw', 'Save', 'Send', 'Shield', 'Star', 'Trash2', 'Upload'
  ];
})();

export function IconPicker({ value, onChange, placeholder = 'Select icon' }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const t = useTranslations('adminServices.iconPicker');

  const filteredIcons = useMemo(() => {
    return allLucideIcons
      .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
      .slice(0, 50);
  }, [search]);

  // Handle icon source once for selection
  const iconsObj = Icons as unknown as Record<string, unknown>;
  const source = (iconsObj.default as Record<string, unknown>) || iconsObj;
  const SelectedIcon = value && source[value] ? source[value] as LucideIcon : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal h-10 rounded-xl border-[#e2e8f0]"
        >
          {SelectedIcon && <SelectedIcon className="mr-2 h-4 w-4" />}
          {!SelectedIcon && <Search className="mr-2 h-4 w-4 opacity-50" />}
          <span className="truncate">{value || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 rounded-xl" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 rounded-lg"
          />
        </div>
        <div className="h-72 p-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-5 gap-1">
            {filteredIcons.map((iconName) => {
              const Icon = (Icons as Record<string, unknown>)[iconName] as LucideIcon;
              if (!Icon) return null;
              
              return (
                <Button
                  key={iconName}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10 p-0 rounded-lg",
                    value === iconName && "bg-[#1392ec]/10 text-[#1392ec]"
                  )}
                  onClick={() => {
                    onChange(iconName);
                  }}
                  title={iconName}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              );
            })}
            {filteredIcons.length === 0 && (
              <div className="col-span-5 p-4 text-center text-sm text-muted-foreground">
                {t('noResults')}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
