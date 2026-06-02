'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import {
  CaretRightIcon,
  LightbulbIcon,
} from '@phosphor-icons/react';
import { doctorsApi } from '@/lib/api/clinical/doctors';
import { Doctor } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export function RecommendedSpecialists() {
  const t = useTranslations('patientOverview');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await doctorsApi.getAll({ limit: 3 });
        if (data && data.length > 0) {
          // Take first 3 for widget
          setDoctors(data.slice(0, 3));
        }
      } catch (error) {
        void error;
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">{t('recommendedSpecialists.title')}</h3>
      </div>
      
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <div className="flex gap-4 items-center"><Skeleton className="w-12 h-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>
            <div className="flex gap-4 items-center"><Skeleton className="w-12 h-12 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></div>
          </div>
        ) : doctors.length > 0 ? (
          doctors.map((doctor) => (
            <Link href={`/patient/doctors/${doctor.id}`} key={doctor.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                {doctor.avatar ? (
                  <Image src={doctor.avatar} alt="Doctor" width={48} height={48} className="w-12 h-12 rounded-full object-cover shadow-sm ring-2 ring-slate-50 dark:ring-slate-800" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800 text-lg shadow-sm">
                    {doctor.fullName.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 dark:text-white leading-tight">{t('doctorPrefix')} {doctor.fullName}</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                    {doctor.specialties && doctor.specialties.length > 0 ? doctor.specialties[0] : t('defaults.specialty')} • {doctor.rating > 0 ? `${doctor.rating} ★` : t('defaults.new')}
                  </p>
                </div>
              </div>
              <CaretRightIcon weight="bold" className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))
        ) : (
          <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
            {t('noDoctors')}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-500/10 rounded-xl border border-teal-100 dark:border-teal-500/20">
          <div className="flex items-start gap-3">
            <LightbulbIcon weight="fill" className="text-teal-600 dark:text-teal-400 mt-0.5 text-xl flex-shrink-0" />
            <div>
              <p className="font-bold text-teal-900 dark:text-teal-400 text-[13px] mb-1">{t('recommendedSpecialists.healthTipTitle')}</p>
              <p className="text-[12px] text-teal-800 dark:text-teal-500/80 leading-relaxed font-medium">{t('recommendedSpecialists.healthTipDesc')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
