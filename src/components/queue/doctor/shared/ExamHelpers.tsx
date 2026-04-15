'use client';

import React from 'react';
import { PlusIcon, MinusIcon, CheckIcon } from '@phosphor-icons/react';

// --- SHARED COMPONENTS ---

interface SectionProps {
  title: string;
  dotColor?: string;
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ title, dotColor = 'bg-blue-500', children, className = '' }) => (
  <div className={`bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

interface FormGroupProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ label, children, className = '' }) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full text-[13px] rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${props.className || ''}`}
  />
);

export const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={`w-full text-[13px] rounded-lg border border-slate-300 px-3 py-2 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all ${props.className || ''}`}
  />
);

export const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full text-[13px] rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none ${props.className || ''}`}
  />
);

// --- NEW UX HELPERS ---

interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (val: string) => void;
  currentValue?: string;
  className?: string;
}

export const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ suggestions, onSelect, currentValue, className = '' }) => (
  <div className={`flex flex-wrap gap-1.5 mt-2 ${className}`}>
    {suggestions.map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onSelect(s)}
        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
          currentValue === s
            ? 'bg-blue-500 border-blue-600 text-white shadow-sm'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-blue-400 hover:bg-white active:scale-95'
        }`}
      >
        {s}
      </button>
    ))}
  </div>
);

interface NumericStepperProps {
  value: string | number | undefined;
  onChange: (val: string) => void;
  step?: number;
  min?: number;
  max?: number;
  className?: string;
}

export const NumericStepper: React.FC<NumericStepperProps> = ({ value, onChange, step = 1, min = 0, max, className = '' }) => {
  const numValue = parseFloat(value?.toString() || '0');
  
  const adjust = (delta: number) => {
    let next = numValue + delta;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    
    // Float precision fix for things like temperature (36.5 + 0.1)
    const formattedNext = step % 1 === 0 ? next.toString() : next.toFixed(1);
    onChange(formattedNext);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button 
        type="button"
        onClick={() => adjust(-step)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 active:scale-95 transition-all"
      >
        <MinusIcon size={14} weight="bold" />
      </button>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-8 text-center text-[13px] font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-transparent"
      />
      <button 
        type="button"
        onClick={() => adjust(step)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 active:scale-95 transition-all"
      >
        <PlusIcon size={14} weight="bold" />
      </button>
    </div>
  );
};

interface ChoiceGridProps {
  options: { value: string; label: string; color?: string }[];
  currentValue?: string;
  onSelect: (val: string) => void;
  className?: string;
}

export const ChoiceGrid: React.FC<ChoiceGridProps> = ({ options, currentValue, onSelect, className = '' }) => (
  <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${className}`}>
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onSelect(opt.value)}
        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all ${
          currentValue === opt.value
            ? opt.color || 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95'
        }`}
      >
        {currentValue === opt.value && <CheckIcon size={14} weight="bold" />}
        {opt.label}
      </button>
    ))}
  </div>
);
