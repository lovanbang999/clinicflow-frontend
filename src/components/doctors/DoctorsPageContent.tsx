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
import { useDoctors } from '@/lib/hooks/useDoctors';
import { DoctorCard } from './DoctorCard';
import { DoctorCardSkeleton } from './DoctorCardSkeleton';
import Image from 'next/image';

const SPECIALTIES = [
  'all',
  'general',
  'cardiology',
  'dermatology',
  'dental',
  'ophthalmology',
  'ent',
  'obstetrics',
] as const;

export function DoctorsPageContent() {
  const t = useTranslations('doctors');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

  // Pass undefined instead of 'all' to get all doctors
  const { doctors, isLoading } = useDoctors({
    isActive: true,
    specialty: selectedSpecialty === 'all' ? undefined : selectedSpecialty,
  });

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

        {/* Filter */}
        <div className="mx-auto mb-12 max-w-7xl">
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger className="h-12 border-slate-200 bg-white">
              <SelectValue placeholder={t('page.filterBySpecialty')} />
            </SelectTrigger>
            <SelectContent>
              {SPECIALTIES.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {t(`specialties.${specialty}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <DoctorCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Doctors Grid */}
        {!isLoading && doctors.length > 0 && (
          <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && doctors.length === 0 && (
          <div className="py-12 text-center">
            <Image
              src="/empty-state/doctors.svg"
              alt="No Doctors Found"
              width={150}
              height={150}
              className="mx-auto w-60 h-60 mb-6"
            />
            <p className="text-lg text-slate-500">{t('page.empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
