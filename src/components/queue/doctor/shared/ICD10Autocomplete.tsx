'use client';

import { useState, useEffect, useRef } from 'react';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';

// Inline hook implementation to avoid extra dependencies
function useOnClickOutside<T extends HTMLElement>(ref: React.RefObject<T | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

interface ICD10AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: { code: string; name: string }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ICD10Autocomplete({ value, onChange, onSelect, placeholder, className, disabled }: ICD10AutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<{ code: string; name: string }[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => setIsOpen(false));

  // Sync prop value to local query if it changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }
      try {
        setIsLoading(true);
        const res = await medicalRecordsApi.searchICD10(query);
        if (Array.isArray(res)) {
          setResults(res);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Failed to fetch ICD10', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: { code: string; name: string }) => {
    setQuery(item.code);
    setIsOpen(false);
    onSelect(item);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value); // Keep parent state in sync for just the string edit
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        value={query}
        onChange={handleInputChange}
        onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-[350px] bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((item) => (
            <div
              key={item.code}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
              onClick={() => handleSelect(item)}
            >
              <div className="text-[13px] font-medium text-slate-800">{item.code}</div>
              <div className="text-[11px] text-slate-500 truncate">{item.name}</div>
            </div>
          ))}
        </div>
      )}
      
      {isOpen && isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
          <div className="text-[11px] text-slate-500 text-center animate-pulse">Đang tìm...</div>
        </div>
      )}
    </div>
  );
}
