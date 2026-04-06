'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDoctors } from '@/lib/hooks/clinical/useDoctors';
import { useServices } from '@/lib/hooks/clinic/useServices';
import { DoctorCard } from './DoctorCard';
import { DoctorCardSkeleton } from './DoctorCardSkeleton';
import Image from 'next/image';
import { Star, TrendingDown, TrendingUp } from 'lucide-react';

export function DoctorsPageContent() {
  const t = useTranslations('doctors');
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating-desc');

  // Fetch active services from API to build dynamic filter buttons
  const { services, isLoading: isLoadingServices } = useServices({ isActive: true });

  // Fetch doctors — re-fetches when selectedServiceId changes (backend supports serviceId filter)
  const { doctors, isLoading: isLoadingDoctors } = useDoctors(
    selectedServiceId ? { serviceId: selectedServiceId } : undefined,
  );

  const isLoading = isLoadingDoctors;

  // Client-side search filter on the already-fetched (and backend-filtered) doctors list
  const filteredDoctors = doctors.filter((doctor) =>
    doctor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === 'rating-desc') return b.rating - a.rating;
    if (sortBy === 'rating-asc') return a.rating - b.rating;
    if (sortBy === 'exp-desc') return b.yearsOfExperience - a.yearsOfExperience;
    if (sortBy === 'exp-asc') return a.yearsOfExperience - b.yearsOfExperience;
    return 0;
  });

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F0F5FF] to-[#E6F0FF] pt-20 pb-32">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.4,82.2,23.1,70.6,34.2C59,45.3,47.1,53.8,35.1,60.8C23.1,67.8,11,73.3,-2.2,77.1C-15.4,80.9,-29.8,83,-42.6,76.6C-55.4,70.2,-66.6,55.3,-74.6,39.6C-82.6,23.9,-87.4,7.4,-85.2,-7.9C-83,-23.2,-73.8,-37.3,-62.1,-48.6C-50.4,-59.9,-36.2,-68.4,-21.8,-75.4C-7.4,-82.4,7.2,-87.9,22.4,-86.5C37.6,-85.1,53.4,-76.8,44.7,-76.4Z"
              fill="#0066FF"
              transform="translate(100 100)"
            ></path>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {t('page.worldClassCare')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
              {t('page.meetOur')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-[#1392ec]">{t('page.specialists')}</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed mb-10">
              {t('page.subtitle')}
            </p>
            <div className="bg-white p-2 rounded-3xl shadow-xl shadow-blue-900/5 max-w-2xl mx-auto border border-slate-100 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 h-14 bg-slate-50 rounded-2xl border border-transparent focus-within:border-[#1392ec]/30 focus-within:bg-white transition-all">
                <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="w-full bg-transparent border-none p-0 text-slate-700 placeholder:text-slate-400 focus:ring-0 font-medium"
                  placeholder={t('page.searchPlaceholder') || "Search doctor, condition, or specialty..."}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="h-14 px-8 bg-[#0066FF] hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center cursor-pointer">
                {t('page.searchButton')}
              </button>
            </div>
          </div>
        </div>
      </div>
      <main className="min-h-screen -mt-20 pb-32 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex overflow-x-auto pb-4 md:pb-0 gap-3 w-full md:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {/* "All" button */}
              <button
                key="all"
                onClick={() => setSelectedServiceId(undefined)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                  selectedServiceId === undefined
                    ? 'border border-[#0066FF] bg-[#0066FF] text-white shadow-md shadow-blue-500/20'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#1392ec]/50 hover:text-[#1392ec]'
                }`}
              >
                {t('specialties.all')}
              </button>

              {/* Dynamic service filter buttons from API */}
              {isLoadingServices
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-28 rounded-full bg-slate-100 animate-pulse shrink-0"
                    />
                  ))
                : services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                        selectedServiceId === service.id
                          ? 'border border-[#0066FF] bg-[#0066FF] text-white shadow-md shadow-blue-500/20'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-[#1392ec]/50 hover:text-[#1392ec]'
                      }`}
                    >
                      {service.name}
                    </button>
                  ))
              }
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end shrink-0">
              <span className="text-sm font-medium text-slate-500">{t('page.sortBy')}</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-auto min-w-[210px] bg-white border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-[#1392ec]/50 transition-all font-display h-10 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-display">
                  <SelectItem className="cursor-pointer" value="rating-desc">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{t('page.sortRatingDesc')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="rating-asc">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-slate-400" />
                      <span>{t('page.sortRatingAsc')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="exp-desc">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>{t('page.sortExpDesc')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem className="cursor-pointer" value="exp-asc">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-slate-400" />
                      <span>{t('page.sortExpAsc')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Loading Skeletons */}
            {isLoading &&
              Array.from({ length: 6 }).map((_, index) => (
                <DoctorCardSkeleton key={index} />
              ))}

            {/* Doctors Grid */}
            {!isLoading && sortedDoctors.length > 0 &&
              sortedDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
          </div>

          {/* Empty State */}
          {!isLoading && sortedDoctors.length === 0 && (
            <div className="py-24 text-center bg-white rounded-3xl border border-slate-100">
              <Image
                src="/empty-state/doctors.svg"
                alt="No Doctors Found"
                width={150}
                height={150}
                className="mx-auto w-40 h-40 mb-6 opacity-80"
              />
              <h3 className="text-xl font-bold text-slate-800 mb-2">{t('page.emptyTitle')}</h3>
              <p className="text-base text-slate-500 max-w-md mx-auto">{t('page.emptyDesc')}</p>
              <button
              onClick={() => { setSearchQuery(''); setSelectedServiceId(undefined); }}
                className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t('page.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
