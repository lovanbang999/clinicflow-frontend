'use client';

import { useBookingStore, BookingType } from '@/lib/store/bookingStore';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Stethoscope, ClipboardList, Check } from 'lucide-react';

export function FlowSelection() {
  const { bookingType, setBookingType } = useBookingStore();
  const t = useTranslations('booking.selection');

  const options: { type: BookingType; icon: React.ElementType; color: string }[] = [
    {
      type: 'CONSULTATION',
      icon: Stethoscope,
      color: 'blue',
    },
    {
      type: 'SPECIALIST',
      icon: ClipboardList,
      color: 'indigo',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = bookingType === option.type;
          
          return (
            <div
              key={option.type}
              onClick={() => {
                setBookingType(option.type);
                // Optionally auto-advance
                // nextStep(); 
              }}
              className={cn(
                "group relative p-6 sm:p-10 transition-all duration-500 rounded-[40px] border-2 bg-white dark:bg-slate-900/50 flex flex-col cursor-pointer overflow-hidden",
                isSelected
                  ? "border-blue-500 shadow-2xl shadow-blue-500/10 -translate-y-2"
                  : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1"
              )}
            >
              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-6 right-6 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300 z-20 shadow-lg shadow-blue-500/20">
                  <Check className="w-5 h-5 text-white stroke-[3]" />
                </div>
              )}

              {/* Icon Container */}
              <div className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-[28px] flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                isSelected 
                  ? "bg-blue-500 text-white shadow-xl shadow-blue-500/30" 
                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-500"
              )}>
                <Icon className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2} />
              </div>

              {/* Text Content */}
              <div className="space-y-3">
                <h3 className={cn(
                  "text-xl sm:text-2xl font-black tracking-tight transition-colors",
                  isSelected ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                )}>
                  {t(`${option.type.toLowerCase()}.title`)}
                </h3>
                <p className="text-blue-500 font-bold text-sm uppercase tracking-widest opacity-80">
                  {t(`${option.type.toLowerCase()}.subtitle`)}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed pt-2">
                  {t(`${option.type.toLowerCase()}.description`)}
                </p>
              </div>

              {/* Decorative background element */}
              <div className={cn(
                "absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-150 group-hover:opacity-[0.06]",
                isSelected ? "bg-blue-500 opacity-[0.08]" : "bg-slate-500"
              )}></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
