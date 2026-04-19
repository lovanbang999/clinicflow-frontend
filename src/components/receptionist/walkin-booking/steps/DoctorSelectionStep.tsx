'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Doctor } from '@/types';
import { UserIcon, CheckCircleIcon, MagnifyingGlassIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';

export function DoctorSelectionStep() {
  const t = useTranslations('receptionistWalkinBooking.doctor');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    getStepNumberClass,
    doctors,
    isLoadingDoctors,
    bookedDoctorIds,
    selectedDoctor,
    setSelectedDoctor,
  } = useWalkinBooking();

  return (
    <div className={`relative pb-6 ${!isStepDone(1) && currentStep !== 2 ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-px bg-slate-200" />

      <div className="flex items-start gap-4">
        <div
          className={`w-8 h-8 rounded-full border-2 text-[13px] font-bold flex items-center justify-center shrink-0 z-10 transition-colors ${getStepNumberClass(2)} ${currentStep > 2 ? 'cursor-pointer hover:shadow-md' : ''}`}
          onClick={() => { if (currentStep > 2) setCurrentStep(2); }}
        >
          2
        </div>
        <div className="flex-1 pt-1.5">
          <div
            className={`mb-4 ${currentStep > 2 ? 'cursor-pointer hover:opacity-80 inline-block transition-opacity' : ''}`}
            onClick={() => { if (currentStep > 2) setCurrentStep(2); }}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('title')}</h3>
            <p className="text-sm text-slate-500 mb-0">{t('desc')}</p>
          </div>

          {currentStep === 2 ? (
            <div className="space-y-3 max-w-[500px]">
              {isLoadingDoctors ? (
                // Loading skeleton
                [1, 2, 3].map(i => (
                  <div key={i} className="border border-slate-100 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                    <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                    <div className="h-9 w-20 bg-slate-100 rounded-lg" />
                  </div>
                ))
              ) : doctors.length === 0 ? (
                // Empty state
                <div className="py-8 px-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                  <MagnifyingGlassIcon size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">{t('noDoctors')}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{t('noDocDesc')}</p>
                </div>
              ) : (
                doctors.map((doctor: Doctor) => {
                  const isSelected = selectedDoctor?.id === doctor.id;
                  const hasBookedToday = bookedDoctorIds.has(doctor.id);

                  // Check availability
                  const getAvailability = () => {
                    if (hasBookedToday) return { status: 'booked', label: t('alreadyBooked'), color: 'amber' };
                    
                    // Check if off today
                    if (doctor.offDays && doctor.offDays.length > 0) {
                      return { status: 'off', label: t('unavailable'), color: 'rose' };
                    }

                    // Check working hours for today
                    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                    const today = days[new Date().getDay()];
                    const worksToday = doctor.workingHours?.some(wh => wh.dayOfWeek === today);
                    
                    if (!worksToday) {
                      return { status: 'no-schedule', label: t('unavailable'), color: 'slate' };
                    }

                    return { status: 'available', label: t('available'), color: 'emerald' };
                  };

                    const availability = getAvailability();
                    const isUnavailable = availability.status !== 'available';

                    const colorClasses: Record<string, string> = {
                      amber: 'bg-amber-50 text-amber-700 border-amber-100',
                      rose: 'bg-rose-50 text-rose-700 border-rose-100',
                      slate: 'bg-slate-50 text-slate-700 border-slate-100',
                      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                    };

                    const currentColors = colorClasses[availability.color] || colorClasses.slate;

                    return (
                      <div
                        key={doctor.id}
                        className={`border-2 rounded-xl p-3 flex items-center gap-3 transition-all relative ${
                          isUnavailable
                            ? 'opacity-60 grayscale select-none border-slate-100 bg-slate-50'
                            : isSelected
                            ? 'border-[#1570EF] bg-white'
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                        }`}
                      >
                        {isUnavailable && (
                          <div className="absolute top-2 right-2 z-20">
                            <div className={`${currentColors} text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-sm flex items-center gap-1`}>
                              <span>{availability.status === 'booked' ? '⌚' : '🚫'}</span> {availability.label}
                            </div>
                          </div>
                        )}

                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 relative">
                        {doctor.avatar
                          ? <Image src={doctor.avatar} alt={doctor.fullName} fill className="object-cover" />
                          : <UserIcon size={24} className="text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        }
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 leading-tight">{doctor.fullName}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{doctor.specialties?.[0] || t('generalPractitioner')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {availability.status === 'available' && (
                          <span className="text-[11px] font-bold text-[#12B76A] bg-[#ecfdf3] px-2 py-1 rounded-md">{t('available')}</span>
                        )}
                        <button
                          onClick={() => {
                            if (isUnavailable) return;
                            setSelectedDoctor(doctor);
                            setCurrentStep(3);
                          }}
                          disabled={isUnavailable}
                          className={`h-9 px-4 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                            isUnavailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : isSelected
                              ? 'bg-[#1570EF] text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected ? t('selectedBtn') : t('selectBtn')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            selectedDoctor && (
              <div className="border-2 border-slate-200 hover:bg-white hover:border-[#1570EF] rounded-2xl p-4 flex items-center gap-5 shadow-xl shadow-[#1570EF]/5 w-full max-w-[600px] animate-in fade-in slide-in-from-top-2 duration-300 relative group overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-[#E0E7FF] border-2 border-[#D1E0FF] flex items-center justify-center shrink-0 overflow-hidden shadow-inner relative">
                  {selectedDoctor.avatar
                    ? <Image src={selectedDoctor.avatar} alt="" fill className="object-cover" />
                    : <UserIcon size={30} className="text-[#3730A3]" weight="bold" />
                  }
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[12px] font-bold text-[#1570EF] bg-[#EFF4FF] px-2.5 py-1 rounded-lg border border-[#D1E0FF] uppercase shadow-sm">
                      {t('selectedBtn')}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-[17px] truncate tracking-tight">{selectedDoctor.fullName}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-slate-600 font-semibold">
                    <span>{selectedDoctor.specialties?.[0] || t('generalPractitioner')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0 z-10">
                  <CheckCircleIcon weight="fill" className="text-[#1570EF] w-5 h-5" />
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-[#1570EF] hover:text-[#0F5ED4] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline"
                  >
                    <PencilSimpleIcon size={12} weight="bold" /> {t('changeBtn')}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
