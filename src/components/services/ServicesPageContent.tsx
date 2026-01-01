'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ServiceCard } from './ServiceCard';
import { ServiceCardSkeleton } from './ServiceCardSkeleton';
import { useServices } from '@/lib/hooks/useServices';
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
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            {t('page.title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">{t('page.subtitle')}</p>
        </div>

        {/* Search */}
        <div className="mx-auto mb-12 max-w-4xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder={t('page.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 border-slate-200 bg-white pl-12 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="mx-auto grid max-w-7xl auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Services Grid */}
        {!isLoading && filteredServices.length > 0 && (
          <div className="mx-auto grid max-w-7xl auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          <div className="py-12 text-center">
            <p className="text-lg text-slate-500">{t('page.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
