'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Award, Briefcase, Check } from 'lucide-react';
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

  return (
    <Card className="group overflow-hidden border-slate-200 transition-all hover:border-blue-300 hover:shadow-xl">
      <CardContent className="p-6">
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <div
            className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-linear-to-br ${avatarColor} text-2xl font-bold text-white shadow-lg`}
          >
            {doctor.avatar ? (
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${doctor.avatar}`}
                alt={doctor.fullName}
                width={96}
                height={96}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="mb-2 text-center text-xl font-semibold text-slate-900">
          {doctor.fullName}
        </h3>

        {/* Primary Specialty */}
        <p className="mb-4 text-center text-sm text-slate-600">
          Chuyên khoa {doctor.specialties[0] || 'Nội tổng quát'}
        </p>

        {/* Rating */}
        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-1 text-yellow-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(doctor.rating) ? 'fill-current' : ''}`}
              />
            ))}
          </div>
          <span className="font-semibold text-slate-900">{doctor.rating.toFixed(1)}/5</span>
        </div>

        <p className="mb-6 text-center text-sm text-slate-500">
          {t('reviews', { count: doctor.reviewCount })}
        </p>

        {/* Info List */}
        <div className="mb-6 space-y-2">
          <div className="flex items-start gap-2 text-sm text-slate-700">
            <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{t('yearsExperience', { years: doctor.yearsOfExperience })}</span>
          </div>

          {doctor.qualifications.slice(0, 2).map((qual, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-slate-700">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{qual}</span>
            </div>
          ))}

          {doctor.specialties.slice(0, 2).map((spec, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-slate-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span>{spec}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link href="/register" className="block">
          <Button className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700">
            {t('bookAppointment')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
