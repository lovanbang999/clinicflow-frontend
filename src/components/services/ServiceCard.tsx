'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { LucideIcon } from 'lucide-react';
import { Service } from '@/types/service';
import { resolveMediaUrl } from '@/lib/utils/media-url';

interface ServiceCardProps {
  service: Service;
  icon: LucideIcon;
  color: string;
}

export function ServiceCard({ service, icon: Icon, color }: ServiceCardProps) {
  const t = useTranslations('services');
  const serviceImageSrc = resolveMediaUrl(service.iconUrl);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col h-full">
      {/* Service Banner Image / Gradient Fallback */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-50 dark:bg-slate-950">
        {serviceImageSrc ? (
          <Image
            src={serviceImageSrc}
            alt={service.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="h-12 w-12 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
        
        {/* Category Badge overlay on top of image */}
        {service.category?.name && (
          <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm select-none border border-slate-100/50 dark:border-slate-800/50">
            {service.category.name}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Card Content Area */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3.25rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {service.name}
        </h3>

        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6 line-clamp-2 min-h-[2rem]">
          {service.description || 'Dịch vụ y khoa chất lượng cao, chuyên nghiệp.'}
        </p>

        {/* Info Row (Duration & Price) */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl mb-6 border border-slate-100/50 dark:border-slate-800/40 mt-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400 select-none">
              schedule
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              {service.durationMinutes} phút
            </span>
          </div>
          
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-slate-400 select-none">
              payments
            </span>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {service.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/services/${service.id}`} className="block">
            <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer text-center whitespace-nowrap active:scale-98">
              {t('actions.viewService')}
            </button>
          </Link>
          <Link href={`/register`} className="block">
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer text-center whitespace-nowrap">
              {t('actions.bookNow')}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
