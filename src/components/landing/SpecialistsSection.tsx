'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { StarIcon } from '@phosphor-icons/react';
import { useDoctors } from '@/lib/hooks/clinical/useDoctors';

export function Specialists() {
  const t = useTranslations('landing');
  const tDoctors = useTranslations('doctors');
  const locale = useLocale();

  // Fetch only active doctors, limiting to 4 for the homepage layout
  const { doctors, isLoading } = useDoctors({ limit: 4 });
  console.log('doctors', doctors);

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-9 bg-slate-100 rounded-lg w-1/3 mx-auto mb-4 animate-pulse" />
            <div className="h-5 bg-slate-100 rounded-lg w-1/2 mx-auto animate-pulse" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm animate-pulse flex flex-col h-full"
              >
                <div className="w-full h-64 bg-slate-100" />
                <div className="p-6 flex flex-col flex-grow">
                  <div className="h-6 bg-slate-100 rounded-lg w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 rounded-lg w-1/2 mb-4" />
                  <div className="h-4 bg-slate-100 rounded-lg w-1/3 mb-6" />
                  <div className="h-10 bg-slate-100 rounded-xl w-full mt-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // 2. Empty/No Doctors Fallback State
  if (!doctors || doctors.length === 0) {
    return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {t('specialists.title')}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">
              {t('specialists.subtitle')}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 px-6 rounded-3xl border border-dashed border-slate-200 max-w-2xl mx-auto">
            <p className="text-slate-400 text-base font-semibold mb-4 text-center">
              {tDoctors('page.empty')}
            </p>
            <Link href="/doctors">
              <button className="bg-[#1392ec] hover:bg-[#0d7cd1] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm cursor-pointer">
                {tDoctors('page.clearFilters') || 'Xem tất cả'}
              </button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // 3. Main Dynamic Specialists Grid
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {t('specialists.title')}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            {t('specialists.subtitle')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((doctor) => {
            const ratingVal = Number(doctor.rating);
            const displayRating = ratingVal > 0 ? ratingVal.toFixed(1) : '5.0';
            const displayReviews = doctor.reviewCount > 0 
              ? tDoctors('card.reviews', { count: doctor.reviewCount })
              : locale === 'vi' ? 'Mới' : 'New';

            return (
              <div
                key={doctor.id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group"
              >
                <div className="relative w-full h-64 bg-slate-50 overflow-hidden">
                  <Image
                    alt={doctor.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={doctor.avatar || '/images/avatar-seed/admin-quan-tri-vien-he-thong.webp'}
                    width={400}
                    height={400}
                    priority={false}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h4 className="text-lg font-bold text-slate-900 mb-1 leading-snug line-clamp-1">
                    {doctor.fullName}
                  </h4>
                  <p className="text-[#1392ec] text-sm font-semibold mb-2 line-clamp-1">
                    {doctor.specialties.join(' • ')}
                  </p>
                  <p className="text-xs text-slate-500 mb-4 font-semibold">
                    {tDoctors('card.yearsExperience', { years: doctor.yearsOfExperience })}
                  </p>
                  <div className="flex items-center gap-1 mb-6 mt-auto">
                    <StarIcon weight="fill" className="text-amber-400 text-sm" />
                    <span className="text-xs font-bold text-slate-700">
                      {displayRating} ({displayReviews})
                    </span>
                  </div>
                  <Link href={`/doctors?doctorId=${doctor.id}`} className="block w-full">
                    <button className="w-full bg-slate-50 hover:bg-[#1392ec] hover:text-white text-[#1392ec] font-bold py-3 rounded-xl transition-all duration-200 text-sm cursor-pointer border border-transparent hover:border-[#1392ec]">
                      {t('specialists.bookAppointment')}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

