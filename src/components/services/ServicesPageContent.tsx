'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ServiceCard } from './ServiceCard';
import { ServiceCardSkeleton } from './ServiceCardSkeleton';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { getServiceIcon, getServiceColor } from '@/lib/utils/service-icons';

export function ServicesPageContent() {
  const t = useTranslations('services');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch services from API
  const { services, isLoading } = useServices({ isActive: true });

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!searchQuery) return services;

    const query = searchQuery.toLowerCase();
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query),
    );
  }, [services, searchQuery]);

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">
          {t('page.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          {t('page.subtitle')}
        </p>
      </div>
      <div className="max-w-2xl mx-auto mb-20">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-blue-600 transition-colors text-2xl">
              search
            </span>
          </div>
          <input
            className="block w-full pl-16 pr-8 py-5 bg-white dark:bg-slate-800 border-none rounded-[24px] shadow-2xl shadow-slate-200/60 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all dark:text-white text-lg placeholder-slate-400"
            placeholder={t('page.searchPlaceholder')}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <ServiceCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Services Grid */}
      {!isLoading && filteredServices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {filteredServices.map((service) => {
            const Icon = getServiceIcon(service.name);
            const color = getServiceColor(service.name);

            return (
              <ServiceCard key={service.id} service={service} icon={Icon} color={color} />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredServices.length === 0 && (
        <div className="py-12 text-center w-full">
          <p className="text-lg text-slate-500">{t('page.empty')}</p>
        </div>
      )}
    </main>
  );
}
