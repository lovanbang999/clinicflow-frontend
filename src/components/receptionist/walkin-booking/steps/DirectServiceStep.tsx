'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  FlaskIcon,
  UserIcon,
  PencilSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  TestTubeIcon,
  HeartbeatIcon,
  CameraIcon,
  BrainIcon,
  ArrowRightIcon,
  XCircleIcon,
  X,
} from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';
import { Doctor, Service } from '@/types';

type ServiceCategory = 'all' | 'LAB' | 'IMAGING' | 'SPECIALIST' | 'FUNCTION';

const ITEMS_PER_PAGE = 8;



export function DirectServiceStep() {
  const t = useTranslations('receptionistWalkinBooking.directService');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    getStepNumberClass,
    allServices,
    isLoadingServices,
    selectedServices,
    toggleService,
    dutyDoctor,
    setDutyDoctor,
    serviceAssignments,
    setServiceAssignment,
    bookedDoctorIds,
    doctors,
    isLoadingDoctors,
    isSubmitting,
    selectedPatient,
  } = useWalkinBooking();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const [page, setPage] = useState(1);
  const [docSearch, setDocSearch] = useState('');
  const [docPage, setDocPage] = useState(1);
  // Which specialist service's doctor picker is open
  const [openPickerServiceId, setOpenPickerServiceId] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  // Filter services
  const filteredServices = useMemo(() => {
    return allServices.filter(svc => {
      const matchSearch = svc.name.toLowerCase().includes(search.toLowerCase());
      let matchCat = true;
      
      if (activeCategory !== 'all') {
        const catType = svc.category?.type ?? '';
        matchCat = catType === activeCategory;
      }
      
      return matchSearch && matchCat;
    });
  }, [allServices, search, activeCategory]);

  const paginatedServices = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredServices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredServices, page]);

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);

  // Filter doctors for duty doctor selection
  const filteredDoctors = useMemo(() => {
    return doctors.filter(d =>
      d.fullName.toLowerCase().includes(docSearch.toLowerCase())
    );
  }, [doctors, docSearch]);

  const paginatedDoctors = useMemo(() => {
    const start = (docPage - 1) * 4;
    return filteredDoctors.slice(start, start + 4);
  }, [filteredDoctors, docPage]);

  const totalDocPages = Math.ceil(filteredDoctors.length / 4);

  const totalAmount = selectedServices.reduce((sum, s) => sum + Number(s.price ?? 0), 0);
  const isStepComplete = isStepDone(2);
  const isActive = currentStep === 2;

  // Services requiring doctor assignment
  const specialistServices = selectedServices.filter(s => s.performerType === 'DOCTOR');

  const categories: { key: ServiceCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: t('catAll'), icon: <FlaskIcon size={12} /> },
    { key: 'SPECIALIST', label: t('catSpecialist'), icon: <BrainIcon size={12} /> },
    { key: 'LAB', label: t('catLab'), icon: <TestTubeIcon size={12} /> },
    { key: 'IMAGING', label: t('catImaging'), icon: <CameraIcon size={12} /> },
    { key: 'FUNCTION', label: t('catFunction'), icon: <HeartbeatIcon size={12} /> },
  ];

  // Doctors filtered for a specific specialist service picker
  const getPickerDoctors = (svc: Service) => {
    const catName = svc.category?.name?.toLowerCase() ?? '';
    return doctors.filter(d => {
      const matchSearch = pickerSearch === '' || d.fullName.toLowerCase().includes(pickerSearch.toLowerCase());
      const matchSpec = d.specialties.some(sp => catName.includes(sp.toLowerCase()) || sp.toLowerCase().includes(catName.split(' ')[0]));
      return matchSearch && (matchSpec || pickerSearch !== '');
    });
  };

  const handleSubmit = () => {
    if (!selectedPatient || selectedServices.length === 0 || !dutyDoctor) return;
    setCurrentStep(3);
    // The actual submit is triggered in AppointmentTimeStep
  };

  return (
    <div className={`relative pb-6 w-full min-w-0 overflow-hidden ${!isStepDone(1) && currentStep !== 2 ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-px bg-slate-200" />

      <div className="flex items-start gap-4 w-full">
        {/* Step Number */}
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
            <p className="text-sm text-slate-500">{t('desc')}</p>
          </div>

          {isActive ? (
            <div className="space-y-5 w-full">
              {/* === SERVICE SELECTION === */}
              <div>
                {/* Search + Category Tabs */}
                <div className="flex flex-col gap-2 mb-3">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20 focus:border-[#1570EF] transition-all"
                    />
                    {search && (
                      <button
                        onClick={() => { setSearch(''); setPage(1); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-200/50"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => { setActiveCategory(cat.key); setPage(1); }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap border transition-all ${
                          activeCategory === cat.key
                            ? 'bg-[#1570EF] text-white border-transparent shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {cat.icon}
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Summary Chip */}
                {selectedServices.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selectedServices.map(svc => (
                      <span
                        key={svc.id}
                        className="flex items-center gap-1 px-2.5 py-1 bg-[#1570EF]/10 text-[#1570EF] text-[11px] font-bold rounded-lg border border-[#1570EF]/20"
                      >
                        {svc.name}
                        <button
                          onClick={() => toggleService(svc)}
                          className="hover:text-[#1165D8] cursor-pointer"
                        >
                          <XCircleIcon size={13} weight="fill" />
                        </button>
                      </span>
                    ))}
                    {totalAmount > 0 && (
                      <span className="ml-auto text-[12px] font-bold text-[#1570EF] flex items-center">
                        {totalAmount.toLocaleString('vi-VN')} ₫
                      </span>
                    )}
                  </div>
                )}

                {/* Service Grid */}
                {isLoadingServices ? (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="border border-slate-100 rounded-xl p-3 flex items-center gap-2 animate-pulse h-14">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 bg-slate-100 rounded w-2/3" />
                          <div className="h-2 bg-slate-100 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="py-10 px-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <p className="text-sm font-bold text-slate-700">{t('noServices')}</p>
                    <p className="text-xs text-slate-400 mt-1">{t('noServicesDesc')}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                      {paginatedServices.map((svc: Service) => {
                        const isSelected = selectedServices.some(s => s.id === svc.id);
                        const isTechnician = svc.performerType === 'TECHNICIAN';

                        return (
                          <div
                            key={svc.id}
                            onClick={() => toggleService(svc)}
                            className={`group border-2 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#1570EF] bg-[#EFF4FF]/60 shadow-sm'
                                : 'border-slate-100 bg-white hover:border-[#1570EF]/40 hover:shadow-sm'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#1570EF]' : 'bg-slate-100'
                            }`}>
                              {isTechnician
                                ? <TestTubeIcon size={14} weight="fill" className={isSelected ? 'text-white' : 'text-slate-500'} />
                                : <UserIcon size={14} weight="fill" className={isSelected ? 'text-white' : 'text-slate-500'} />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] font-bold truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {svc.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                  isTechnician ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {isTechnician ? t('technicianBadge') : t('doctorBadge')}
                                </span>
                                {svc.price && Number(svc.price) > 0 && (
                                  <span className="text-[11px] text-slate-500 font-semibold">
                                    {Number(svc.price).toLocaleString('vi-VN')} ₫
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircleIcon size={18} weight="fill" className="text-[#1570EF] shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPage(p => Math.max(1, p - 1)); }}
                          disabled={page === 1}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <CaretLeftIcon size={14} weight="bold" />
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setPage(i + 1)}
                              className={`w-7 h-7 rounded-xl text-[11px] font-bold transition-all ${
                                page === i + 1
                                  ? 'bg-[#1570EF] text-white shadow-sm'
                                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 cursor-pointer'
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPage(p => Math.min(totalPages, p + 1)); }}
                          disabled={page === totalPages}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <CaretRightIcon size={14} weight="bold" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* === PER-SERVICE SPECIALIST DOCTOR ASSIGNMENT (Issue 2) === */}
              {specialistServices.length > 0 && (
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">Bác sĩ thực hiện</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Chọn bác sĩ thực hiện cho từng dịch vụ chuyên khoa</p>
                  </div>
                  {specialistServices.map((svc: Service) => {
                    const assignedDoctorId = serviceAssignments[svc.id];
                    const assignedDoctor = doctors.find(d => d.id === assignedDoctorId);
                    const isPickerOpen = openPickerServiceId === svc.id;
                    const pickerDoctors = isPickerOpen ? getPickerDoctors(svc) : [];

                    return (
                      <div key={svc.id} className="rounded-xl border border-slate-200 overflow-hidden">
                        {/* Service row */}
                        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50">
                          <div className="flex items-center gap-2">
                            <UserIcon size={13} className="text-emerald-500 shrink-0" />
                            <span className="text-[12px] font-bold text-slate-700">{svc.name}</span>
                          </div>
                          <button
                            onClick={() => {
                              if (isPickerOpen) {
                                setOpenPickerServiceId(null);
                              } else {
                                setOpenPickerServiceId(svc.id);
                                setPickerSearch('');
                              }
                            }}
                            className="text-[11px] font-bold text-[#1570EF] hover:text-[#1165D8] flex items-center gap-1 cursor-pointer"
                          >
                            {assignedDoctor ? (
                              <><CheckCircleIcon size={13} weight="fill" />{assignedDoctor.fullName}</>
                            ) : (
                              <span className="text-amber-500">⚠ Chưa chọn bác sĩ</span>
                            )}
                          </button>
                        </div>

                        {/* Doctor picker dropdown */}
                        {isPickerOpen && (
                          <div className="p-3 border-t border-slate-100">
                            <div className="relative mb-2">
                              <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                              <input
                                autoFocus
                                type="text"
                                placeholder="Tìm bác sĩ..."
                                value={pickerSearch}
                                onChange={e => setPickerSearch(e.target.value)}
                                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1570EF]/30 focus:border-[#1570EF] transition-all"
                              />
                              {pickerSearch && (
                                <button
                                  onClick={() => setPickerSearch('')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/50"
                                >
                                  <X size={12} weight="bold" />
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                              {pickerDoctors.length === 0 ? (
                                <p className="col-span-2 text-center text-[11px] text-slate-400 py-3">Không tìm thấy bác sĩ phù hợp</p>
                              ) : pickerDoctors.slice(0, 6).map((doc: Doctor) => {
                                const isChosen = assignedDoctorId === doc.id;
                                return (
                                  <button
                                    key={doc.id}
                                    onClick={() => {
                                      setServiceAssignment(svc.id, isChosen ? null : doc.id);
                                      setOpenPickerServiceId(null);
                                    }}
                                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all border ${
                                      isChosen
                                        ? 'border-[#1570EF] bg-[#EFF4FF]/60'
                                        : 'border-slate-100 hover:border-[#1570EF]/40 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="w-6 h-6 rounded-full bg-slate-100 relative shrink-0 overflow-hidden">
                                      {doc.avatar
                                        ? <Image src={doc.avatar} alt={doc.fullName} fill className="object-cover" />
                                        : <UserIcon size={12} className="text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                      }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[11px] font-bold text-slate-700 truncate">{doc.fullName}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{doc.specialties?.[0] ?? 'Đa khoa'}</p>
                                    </div>
                                    {isChosen && <CheckCircleIcon size={14} weight="fill" className="text-[#1570EF] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* === DUTY DOCTOR SELECTION === */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-start gap-2 mb-3">
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{t('dutyDoctorLabel')}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t('dutyDoctorNote')}</p>
                  </div>
                </div>

                {/* Doctor search */}
                <div className="relative mb-3">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder="Tìm bác sĩ trực..."
                    value={docSearch}
                    onChange={(e) => { setDocSearch(e.target.value); setDocPage(1); }}
                    className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1570EF]/20 focus:border-[#1570EF] transition-all"
                  />
                  {docSearch && (
                    <button
                      onClick={() => { setDocSearch(''); setDocPage(1); }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/50"
                    >
                      <X size={12} weight="bold" />
                    </button>
                  )}
                </div>

                {isLoadingDoctors ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2].map(i => (
                      <div key={i} className="border border-slate-100 rounded-xl p-3 animate-pulse h-14" />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {paginatedDoctors.map((doctor: Doctor) => {
                        const isSelected = dutyDoctor?.id === doctor.id;
                        const isBooked = bookedDoctorIds.has(doctor.id);
                        return (
                          <div
                            key={doctor.id}
                            onClick={() => !isBooked && setDutyDoctor(doctor)}
                            className={`group border-2 rounded-xl p-3 flex items-center gap-3 transition-all ${
                              isBooked
                                ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                                : isSelected
                                  ? 'border-[#1570EF] bg-[#EFF4FF]/60 shadow-sm cursor-pointer'
                                  : 'border-slate-100 bg-white hover:border-[#1570EF]/40 hover:shadow-sm cursor-pointer'
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-100 relative">
                              {doctor.avatar
                                ? <Image src={doctor.avatar} alt={doctor.fullName} fill className="object-cover" />
                                : <UserIcon size={16} className="text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[12px] font-bold truncate ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                {doctor.fullName}
                              </p>
                              {isBooked ? (
                                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Đã có lịch hôm nay</span>
                              ) : (
                                <p className="text-[10px] text-slate-400 truncate">{doctor.specialties?.[0] ?? 'Bác sĩ đa khoa'}</p>
                              )}
                            </div>
                            {isSelected && !isBooked && (
                              <CheckCircleIcon size={16} weight="fill" className="text-[#1570EF] shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {totalDocPages > 1 && (
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => setDocPage(p => Math.max(1, p - 1))}
                          disabled={docPage === 1}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <CaretLeftIcon size={12} weight="bold" />
                        </button>
                        <span className="text-[11px] text-slate-500 font-bold">{docPage}/{totalDocPages}</span>
                        <button
                          onClick={() => setDocPage(p => Math.min(totalDocPages, p + 1))}
                          disabled={docPage === totalDocPages}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <CaretRightIcon size={12} weight="bold" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Flow Note */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[#EFF4FF] border border-[#1570EF]/20">
                <ArrowRightIcon size={14} className="text-[#1570EF] shrink-0 mt-0.5" weight="bold" />
                <p className="text-[11px] text-[#1e40af] leading-relaxed font-medium">{t('flowNote')}</p>
              </div>

              {/* Next Button */}
              <button
                onClick={handleSubmit}
                disabled={!isStepComplete || isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-[#1570EF] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#1165D8] transition-all shadow-lg shadow-[#1570EF]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowRightIcon size={16} weight="bold" />
                Tiếp theo — Chọn thời gian
              </button>
            </div>
          ) : (
            /* Collapsed summary view */
            isStepComplete && (
              <div className="border-2 border-slate-200 hover:border-[#1570EF] rounded-2xl p-4 flex items-center gap-4 shadow-sm w-full max-w-[600px] animate-in fade-in slide-in-from-top-2 duration-300 group transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold text-[#1570EF] bg-[#EFF4FF] px-2 py-0.5 rounded-lg border border-[#1570EF]/20">
                      {selectedServices.length} dịch vụ
                    </span>
                    {dutyDoctor && (
                      <span className="text-[11px] text-slate-500 font-medium truncate">
                        · {dutyDoctor.fullName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedServices.slice(0, 3).map(s => (
                      <span key={s.id} className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                        {s.name}
                      </span>
                    ))}
                    {selectedServices.length > 3 && (
                      <span className="text-[11px] text-slate-400 font-medium">+{selectedServices.length - 3} nữa</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <CheckCircleIcon weight="fill" className="text-[#1570EF] w-5 h-5" />
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-[#1570EF] hover:text-[#1165D8] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline"
                  >
                    <PencilSimpleIcon size={12} weight="bold" /> Thay đổi
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
