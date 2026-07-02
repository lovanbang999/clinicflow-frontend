'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowRightIcon,
  ClockIcon,
  StethoscopeIcon,
  HeartbeatIcon,
  BabyIcon,
} from '@phosphor-icons/react';
import Image from 'next/image';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { resolveMediaUrl } from '@/lib/utils/media-url';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export function Services() {
  const t = useTranslations('landing');
  const locale = useLocale();

  // Only load services performed by DOCTOR
  const { services, isLoading } = useServices({ isActive: true, performedBy: 'DOCTOR' });

  const getServiceIconStyles = (serviceName: string) => {
    const nameLower = serviceName.toLowerCase();
    if (nameLower.includes('tim') || nameLower.includes('mạch') || nameLower.includes('cardio')) {
      return {
        bg: 'bg-red-50',
        color: 'text-red-500',
        icon: <HeartbeatIcon weight="fill" className="text-2xl" />
      };
    }
    if (nameLower.includes('nhi') || nameLower.includes('trẻ') || nameLower.includes('pediatr')) {
      return {
        bg: 'bg-teal-50',
        color: 'text-teal-600',
        icon: <BabyIcon weight="fill" className="text-2xl" />
      };
    }
    return {
      bg: 'bg-blue-50',
      color: 'text-[#1392ec]',
      icon: <StethoscopeIcon weight="fill" className="text-2xl" />
    };
  };

  // 1. Loading Skeleton State (Aspect-ratio layout using shadcn/ui components)
  if (isLoading) {
    return (
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 animate-pulse">
            <div>
              <div className="h-9 bg-slate-200 rounded-lg w-48 mb-4" />
              <div className="h-5 bg-slate-200 rounded-lg w-72" />
            </div>
            <div className="h-6 bg-slate-200 rounded-lg w-24 hidden md:block" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <Card
                key={index}
                className="bg-white border-slate-100 shadow-sm flex flex-col h-full overflow-hidden py-0 gap-0"
              >
                <Skeleton className="w-full aspect-[16/10] rounded-none" />
                <CardContent className="p-6 flex flex-col flex-grow gap-4">
                  <Skeleton className="h-7 w-3/4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <div className="flex items-center gap-4 mt-auto">
                    <Skeleton className="h-4 w-16" />
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 2. Empty Fallback State
  if (!services || services.length === 0) {
    return (
      <section className="py-24 bg-[#F8FAFF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('services.title')}</h2>
          <p className="text-slate-500 text-lg mb-8">{t('services.subtitle')}</p>
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl border border-dashed border-slate-200 bg-white max-w-xl mx-auto">
            <p className="text-slate-400 text-base font-semibold">
              {locale === 'vi' ? 'Hiện chưa có dịch vụ bác sĩ nào hoạt động.' : 'No active doctor services available.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // 3. Main Services Grid (Showing first 3 services)
  const displayServices = services.slice(0, 3);

  return (
    <section className="py-24 bg-[#F8FAFF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('services.title')}</h2>
            <p className="text-slate-500 text-lg">{t('services.subtitle')}</p>
          </div>
          <Link href="/services" className="hidden md:flex items-center text-[#1392ec] font-bold gap-2 hover:gap-3 transition-all cursor-pointer">
            {t('services.viewAll')} <ArrowRightIcon weight="bold" className="text-lg" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service) => {
            const styles = getServiceIconStyles(service.name);
            const displayBadge = service.category?.name || t('services.badgePrimary');
            const displayDuration = locale === 'vi'
              ? `${service.durationMinutes} phút`
              : `${service.durationMinutes} mins`;
            const displayPrice = locale === 'vi' 
              ? `Từ ${new Intl.NumberFormat('vi-VN').format(service.price)}đ` 
              : `From $${new Intl.NumberFormat('en-US').format(service.price)}`;
            const serviceImageSrc = resolveMediaUrl(service.iconUrl);

            return (
              <Card
                key={service.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-[#1392ec]/5 hover:-translate-y-1 flex flex-col h-full overflow-hidden group py-0 gap-0"
              >
                {/* Service Banner Image / Gradient Fallback */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-50 border-b border-slate-100">
                  {serviceImageSrc ? (
                    <Image
                      src={serviceImageSrc}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className={`w-full h-full ${styles.bg} flex items-center justify-center`}>
                      <div className={styles.color}>
                        {styles.icon}
                      </div>
                    </div>
                  )}

                  {/* Category Badge overlay on top of image */}
                  <div className="absolute top-4 left-4 z-10 select-none">
                    <Badge variant="secondary" className="bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 shadow-sm border border-slate-100/50 hover:bg-white/95">
                      {displayBadge}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-6 flex flex-col flex-grow gap-0">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-[#1392ec] transition-colors duration-300">
                    {service.name}
                  </h3>
                  <p className="text-slate-500 mb-6 text-sm line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm font-medium text-slate-400 mt-auto">
                    <span className="flex items-center gap-1">
                      <ClockIcon weight="bold" className="text-base" /> {displayDuration}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[#1392ec] font-bold">{displayPrice}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/services" className="inline-flex items-center text-[#1392ec] font-bold gap-2">
            {t('services.viewAll')} <ArrowRightIcon weight="bold" className="text-lg" />
          </Link>
        </div>
      </div>
    </section>
  );
}
