'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Doctor } from '@/types/doctor';

interface DoctorCardProps {
  doctor: Doctor;
}

const AVATAR_COLORS = [
  'from-blue-500 to-blue-600',
  'from-green-500 to-emerald-600',
  'from-orange-500 to-amber-600',
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-teal-600',
];

export function DoctorCard({ doctor }: DoctorCardProps) {
  const t = useTranslations('doctors.card');

  // Generate consistent color based on doctor ID
  const colorIndex = parseInt(doctor.id.slice(0, 8), 16) % AVATAR_COLORS.length;
  const avatarColor = AVATAR_COLORS[colorIndex];

  // Get initials from name
  const initials = doctor.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const formatReviewCount = (count: number) => {
    return t('reviews', { count: count }).replace(' đánh giá', '').replace(' reviews', '') + ' Reviews';
  };

  return (
    <div className="bg-white rounded-3xl p-8 flex flex-col relative border border-slate-100 h-full shadow-[0_20px_40px_-4px_rgba(20,25,40,0.06)] hover:-translate-y-2 hover:shadow-[0_30px_60px_-8px_rgba(20,25,40,0.12)] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform group">
      <div className="absolute top-6 right-6">
        <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="w-28 h-28 rounded-full p-1 bg-white ring-1 ring-slate-100 shadow-lg mb-4 overflow-hidden relative">
          {doctor.avatar ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}${doctor.avatar}`}
              alt={doctor.fullName}
              width={112}
              height={112}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className={`w-full h-full rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-3xl font-bold text-white`}>
              {initials}
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-1 text-center">
          {doctor.fullName}
        </h3>
        <p className="text-[#0066FF] text-sm font-semibold bg-blue-50 px-3 py-1 rounded-lg text-center">
          {doctor.specialties[0] || 'General Practice'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-slate-50 w-full">
        <div className="text-center px-4 border-r border-slate-50">
          <div className="flex items-center justify-center gap-1 text-slate-900 font-bold">
            <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {Number(doctor.rating || 0).toFixed(1)}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{formatReviewCount(doctor.reviewCount)}</p>
        </div>
        <div className="text-center px-4">
          <div className="flex items-center justify-center gap-1 text-slate-900 font-bold">
            <svg className="w-4 h-4 text-blue-400 fill-current" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM11 7h2v4h4v2h-4v4h-2v-4H7v-2h4V7z" />
            </svg>
            {doctor.yearsOfExperience}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">Years Exp.</p>
        </div>
      </div>

      <div className="space-y-3 mb-8 px-2">
        {/* We map maximum 2 qualifications/services or fallback to specialties to show checkmarks */}
        {(doctor.qualifications.length > 0 ? doctor.qualifications : doctor.specialties).slice(0, 2).map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-green-500 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-slate-600 font-medium leading-snug">{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <Link href={`/doctors/${doctor.id}`} className="block">
          <button className="w-full h-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap">
            {t('viewProfile')}
          </button>
        </Link>
        <Link href={`/register`} className="block">
          <button className="w-full px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-slate-900/10 active:scale-95 cursor-pointer whitespace-nowrap">
            {t('bookNow')}
          </button>
        </Link>
      </div>
    </div>
  );
}
