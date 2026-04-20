'use client';

import { Service } from '@/types';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { useDebounce } from '@/lib/hooks/core/useDebounce';
import { useTranslations } from 'next-intl';
import { 
  FirstAidIcon, 
  HeartIcon,
  StethoscopeIcon, 
  BabyIcon, 
  BrainIcon,
  EyeIcon,
  MicroscopeIcon,
  CalendarCheckIcon
} from '@phosphor-icons/react';

interface ServiceSelectorProps {
  onSelect?: (service: Service) => void;
  searchQuery?: string;
}

// Helper to get icon based on service name
const getServiceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('checkup') || n.includes('general')) return { icon: FirstAidIcon, color: 'bg-blue-50 text-blue-500' };
  if (n.includes('cardio')) return { icon: HeartIcon, color: 'bg-red-50 text-red-500' };
  if (n.includes('derma')) return { icon: MicroscopeIcon, color: 'bg-yellow-50 text-yellow-600' };
  if (n.includes('pedia')) return { icon: BabyIcon, color: 'bg-purple-50 text-purple-500' };
  if (n.includes('neuro')) return { icon: BrainIcon, color: 'bg-slate-50 text-slate-500' };
  if (n.includes('eye') || n.includes('opht')) return { icon: EyeIcon, color: 'bg-green-50 text-green-500' };
  return { icon: StethoscopeIcon, color: 'bg-blue-50 text-blue-500' };
};

export function ServiceSelector({ onSelect, searchQuery = '' }: ServiceSelectorProps) {
  const debouncedSearch = useDebounce(searchQuery, 400);
  const { services, isLoading } = useServices({ 
    isActive: true, 
    search: debouncedSearch,
    categoryType: 'EXAMINATION'
  });
  
  const { selectedService, setSelectedService } = useBookingStore();
  const t = useTranslations('booking.serviceSelector');

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    onSelect?.(service);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[30px] border border-dashed border-slate-200 dark:border-slate-700">
        <CalendarCheckIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
          {searchQuery ? t('noServicesFound', { query: searchQuery }) : t('noServicesAvailable')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((service) => {
        const isSelected = selectedService?.id === service.id;
        const { icon: Icon, color } = getServiceIcon(service.name);

        return (
          <div
            key={service.id}
            className={cn(
              'group relative p-5 sm:p-8 cursor-pointer transition-all duration-300 rounded-[32px] border-2 bg-white dark:bg-slate-900/50 flex flex-col',
              isSelected
                ? 'border-blue-500 shadow-2xl shadow-blue-500/10 -translate-y-1'
                : 'border-slate-100/80 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1'
            )}
            onClick={() => handleServiceClick(service)}
          >
            {isSelected && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
            )}

            <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shrink-0 transition-transform group-hover:scale-110 duration-300", color)}>
              <Icon weight="fill" className="text-xl sm:text-2xl" />
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-2 sm:mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {service.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 sm:mb-10 line-clamp-3">
                {service.description || t('defaultDescription')}
              </p>
            </div>

            <div className="flex items-end justify-between mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('price')}</p>
                <p className="font-extrabold text-slate-900 dark:text-white text-lg leading-none">
                  {Number(service.price).toLocaleString('vi-VN')} ₫
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t('duration')}</p>
                <p className="font-bold text-slate-600 dark:text-slate-300 text-sm leading-none">
                  {service.durationMinutes} {t('min')}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
