'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Doctor } from '@/types';
import { UserIcon, CheckCircleIcon, MagnifyingGlassIcon, PencilSimpleIcon, CaretLeftIcon, CaretRightIcon, CurrencyCircleDollarIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

type PriceRange = 'all' | 'free' | 'under300' | 'over300';

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

  // Filter & Pagination State
  const [docSearch, setDocSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<PriceRange>('all');
  const [docPage, setDocPage] = useState(1);
  const itemsPerPage = 6;

  // Extract unique specialties
  const allSpecialties = useMemo(() => {
    const specs = new Set<string>();
    doctors.forEach(d => {
      d.specialties?.forEach(s => specs.add(s));
    });
    return Array.from(specs).sort();
  }, [doctors]);

  // Filter logic
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d => {
      const matchSearch = d.fullName.toLowerCase().includes(docSearch.toLowerCase());
      const matchSpec = selectedSpec === 'all' || d.specialties?.includes(selectedSpec);
      
      const fee = Number(d.consultationFee || 0);
      let matchPrice = true;
      if (selectedPrice === 'free') matchPrice = fee === 0;
      else if (selectedPrice === 'under300') matchPrice = fee > 0 && fee < 300000;
      else if (selectedPrice === 'over300') matchPrice = fee >= 300000;

      return matchSearch && matchSpec && matchPrice;
    });
  }, [doctors, docSearch, selectedSpec, selectedPrice]);

  // Pagination logic
  const paginatedDoctors = useMemo(() => {
    const start = (docPage - 1) * itemsPerPage;
    return filteredDoctors.slice(start, start + itemsPerPage);
  }, [filteredDoctors, docPage]);

  const totalDocPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  return (
    <div className={`relative pb-6 w-full min-w-0 overflow-hidden ${!isStepDone(1) && currentStep !== 2 ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-px bg-slate-200" />

      <div className="flex items-start gap-4 w-full">
        <div
          className={`w-8 h-8 rounded-full border-2 text-[13px] font-bold flex items-center justify-center shrink-0 z-10 transition-colors ${getStepNumberClass(2)} ${currentStep > 2 ? 'cursor-pointer hover:shadow-md' : ''}`}
          onClick={() => { if (currentStep > 2) setCurrentStep(2); }}
        >
          2
        </div>
        <div className="flex-1 pt-1.5 min-w-0 overflow-hidden">
          <div
            className={`mb-4 ${currentStep > 2 ? 'cursor-pointer hover:opacity-80 inline-block transition-opacity' : ''}`}
            onClick={() => { if (currentStep > 2) setCurrentStep(2); }}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('title')}</h3>
            <p className="text-sm text-slate-500 mb-0">{t('desc')}</p>
          </div>

          {currentStep === 2 ? (
            <div className="space-y-4 w-full">
              {/* Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={docSearch}
                    onChange={(e) => {
                      setDocSearch(e.target.value);
                      setDocPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20 focus:border-[#1570EF] transition-all"
                  />
                </div>

                <div className="relative w-full md:w-[180px]">
                  <CurrencyCircleDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
                  <Select
                    value={selectedPrice}
                    onValueChange={(val) => {
                      setSelectedPrice(val as PriceRange);
                      setDocPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full pl-10 h-[42px] bg-slate-50 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1570EF]/20 focus:border-[#1570EF] transition-all cursor-pointer">
                      <SelectValue placeholder={t('allPrices')} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} >
                      <SelectItem value="all">{t('allPrices')}</SelectItem>
                      <SelectItem value="free">{t('freeOnly')}</SelectItem>
                      <SelectItem value="under300">{t('under300')}</SelectItem>
                      <SelectItem value="over300">{t('over300')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Specialty Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
                <button
                  onClick={() => {
                    setSelectedSpec('all');
                    setDocPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                    selectedSpec === 'all'
                      ? 'bg-[#1570EF] text-white border-transparent shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t('allSpecialties')}
                </button>
                {allSpecialties.map(spec => (
                  <button
                    key={spec}
                    onClick={() => {
                      setSelectedSpec(spec);
                      setDocPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedSpec === spec
                        ? 'bg-[#1570EF] text-white border-transparent shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {isLoadingDoctors ? (
                // Loading skeleton
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border border-slate-100 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                      <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-1/2" />
                        <div className="h-3 bg-slate-100 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredDoctors.length === 0 ? (
                // Empty state
                <div className="py-12 px-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MagnifyingGlassIcon size={32} className="text-slate-300" />
                  </div>
                  <p className="text-base font-bold text-slate-900">{t('noDoctors')}</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-[280px] mx-auto">{t('noDocDesc')}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {paginatedDoctors.map((doctor: Doctor) => {
                      const isSelected = selectedDoctor?.id === doctor.id;
                      const hasBookedToday = bookedDoctorIds.has(doctor.id);

                      // Check availability
                      const getAvailability = () => {
                        if (hasBookedToday) return { status: 'booked', label: t('alreadyBooked'), color: 'amber' };
                        
                        if (doctor.offDays && doctor.offDays.length > 0) {
                          return { status: 'off', label: t('unavailable'), color: 'rose' };
                        }

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
                          onClick={() => {
                            if (isUnavailable) return;
                            setSelectedDoctor(doctor);
                            setCurrentStep(3);
                          }}
                          className={`group border-2 rounded-2xl p-4 flex flex-col transition-all relative cursor-pointer overflow-hidden ${
                            isUnavailable
                              ? 'opacity-60 grayscale select-none border-slate-100 bg-slate-50'
                              : isSelected
                              ? 'border-[#1570EF] bg-[#EFF4FF]/30 ring-4 ring-[#1570EF]/5'
                              : 'border-slate-100 bg-white hover:border-[#1570EF]/50 hover:shadow-lg hover:shadow-[#1570EF]/5 hover:-translate-y-0.5'
                          }`}
                        >
                          {isUnavailable && (
                            <div className="absolute top-2 right-2 z-20">
                              <div className={`${currentColors} text-[10px] font-bold px-2 py-0.5 rounded-md border shadow-sm flex items-center gap-1`}>
                                <span>{availability.status === 'booked' ? '⌚' : '🚫'}</span> {availability.label}
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative border border-slate-200 group-hover:border-[#1570EF]/30 transition-colors">
                              {doctor.avatar
                                ? <Image src={doctor.avatar} alt={doctor.fullName} fill className="object-cover" />
                                : <UserIcon size={24} className="text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-slate-900 leading-tight text-[14px] group-hover:text-[#1570EF] transition-colors truncate">
                                {doctor.fullName}
                              </h4>
                              <p className="text-[11px] text-slate-500 mt-1 font-medium truncate">
                                {doctor.specialties?.[0] || t('generalPractitioner')}
                              </p>
                              <p className="text-[10px] font-bold text-[#1570EF] mt-2 bg-[#EFF4FF] inline-block px-2 py-0.5 rounded-lg border border-[#D1E0FF]">
                                {t('consultationFee')}: {doctor.consultationFee && Number(doctor.consultationFee) > 0 
                                  ? `${Number(doctor.consultationFee).toLocaleString('vi-VN')} ₫`
                                  : t('free')}
                              </p>
                            </div>
                          </div>

                          <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                            {availability.status === 'available' ? (
                              <span className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A] animate-pulse" />
                                <span className="text-[10px] font-bold text-[#12B76A]">{t('available')}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">{availability.label}</span>
                            )}
                            <button
                              className={`h-7 px-3 rounded-lg text-[11px] font-bold transition-all ${
                                isUnavailable
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-[#1570EF] text-white shadow-md shadow-[#1570EF]/20'
                                  : 'bg-white border border-slate-200 text-[#1570EF] hover:bg-[#1570EF] hover:text-white hover:border-transparent'
                              }`}
                            >
                              {isSelected ? t('selectedBtn') : t('selectBtn')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Controls */}
                  {totalDocPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDocPage(p => Math.max(1, p - 1)); }}
                        disabled={docPage === 1}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <CaretLeftIcon size={16} weight="bold" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalDocPages }).map((_, i) => (
                          <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setDocPage(i + 1); }}
                            className={`w-7 h-7 rounded-xl text-[11px] font-bold transition-all ${
                              docPage === i + 1
                                ? 'bg-[#1570EF] text-white shadow-md shadow-[#1570EF]/20'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 cursor-pointer'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDocPage(p => Math.min(totalDocPages, p + 1)); }}
                        disabled={docPage === totalDocPages}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                      >
                        <CaretRightIcon size={16} weight="bold" />
                      </button>
                    </div>
                  )}
                </>
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
                    <div className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
                    <span className="text-[#1570EF]">
                      {t('consultationFee')}: {selectedDoctor.consultationFee && Number(selectedDoctor.consultationFee) > 0 
                        ? `${Number(selectedDoctor.consultationFee).toLocaleString('vi-VN')} ₫`
                        : t('free')}
                    </span>
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
