'use client';

import * as React from 'react';
import { Control, Controller, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
}

export function FormSelect<T extends FieldValues>({
  control,
  name,
  options,
  placeholder = 'Chọn...',
  className,
  disabled,
  rules,
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Select
          onValueChange={field.onChange}
          defaultValue={field.value}
          value={field.value}
          disabled={disabled}
        >
          <SelectTrigger 
            ref={field.ref}
            className={cn(
              "w-full bg-slate-50 border-slate-200 rounded-xl h-12 text-sm font-bold focus:bg-white focus:border-blue-400 outline-none transition-all",
              fieldState.error && "border-rose-300 bg-rose-50/10 focus:border-rose-400 focus:ring-rose-50",
              className
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4} className="rounded-xl border-slate-200 shadow-xl">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-sm font-medium py-2.5 rounded-lg focus:bg-blue-50 focus:text-blue-700"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
