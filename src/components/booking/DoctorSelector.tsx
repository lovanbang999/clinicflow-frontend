'use client';

import { useState, useEffect } from 'react';
import { Doctor } from '@/types';
import { doctorsApi } from '@/lib/api/doctors';
import { cn } from '@/lib/utils';
import { Loader2, Star, Check } from 'lucide-react';
import { useBookingStore } from '@/lib/store/bookingStore';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface DoctorSelectorProps {
  onSelect?: (doctor: Doctor) => void;
}

export function DoctorSelector({ onSelect }: DoctorSelectorProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedDoctor, setSelectedDoctor, selectedService } = useBookingStore();
  const t = useTranslations('booking.doctorSelector');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        // Filter by serviceId if a service is selected
        const data = await doctorsApi.getAll({
          ...(selectedService?.id ? { serviceId: selectedService.id } : {}),
        });
        setDoctors(data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedService]);

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    onSelect?.(doctor);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[30px] border border-dashed border-slate-200 dark:border-slate-700">
        <Image alt="No doctors available" src="/empty-state/doctors.svg" width={200} height={200} className="mx-auto mb-6 opacity-80 dark:opacity-40" />
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">{t('noDoctorsAvailable')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => {
        const isSelected = selectedDoctor?.id === doctor.id;

        return (
          <div
            key={doctor.id}
            className={cn(
              'group relative p-8 cursor-pointer transition-all duration-300 rounded-[32px] border-2 bg-white dark:bg-slate-900/50 flex flex-col items-center text-center',
              isSelected
                ? 'border-blue-500 shadow-2xl shadow-blue-500/10 -translate-y-1'
                : 'border-slate-100/80 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-500/50 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:-translate-y-1'
            )}
            onClick={() => handleDoctorClick(doctor)}
          >
            {isSelected && (
              <div className="absolute top-5 right-5 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in-50 duration-300">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            )}

            <div className="relative mb-6 mt-2">
              <div className={cn(
                "w-24 h-24 rounded-[32px] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 duration-300 shrink-0",
                isSelected ? "bg-teal-100 dark:bg-teal-900/30 ring-4 ring-blue-500/20" : "bg-teal-50 dark:bg-slate-800"
              )}>
                {doctor.avatar ? (
                  <Image src={doctor.avatar} alt={doctor.fullName} width={96} height={96} className="w-full h-full object-cover" />
                ) : (
                  <Image 
                    src={doctor.gender === 'FEMALE' ? '/images/avatars/doctor-female.png' : '/images/avatars/doctor-male.png'} 
                    alt="Default avatar" 
                    width={96} 
                    height={96} 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center z-10 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-900 box-content"></div>
              </div>
            </div>

            <div className="flex-1 w-full space-y-1">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {doctor.fullName}
              </h3>
              
              {doctor.specialties && doctor.specialties.length > 0 && (
                <p className={cn(
                  "text-sm font-medium transition-colors",
                  isSelected ? "text-blue-500" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )}>
                  {doctor.specialties[0]}
                </p>
              )}

              <div className="flex items-center justify-center pt-3 pb-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100/80 dark:border-slate-700 font-medium">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm text-slate-800 dark:text-slate-200">
                    {Number(doctor.rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({doctor.reviewCount} {t('reviews')})
                  </span>
                </div>
              </div>

              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mt-4 line-clamp-2">
                {doctor.bio || `${t('specialist')} ${doctor.specialties?.[0] || t('generalPractice')} ${t('experience', { years: doctor.yearsOfExperience })}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
