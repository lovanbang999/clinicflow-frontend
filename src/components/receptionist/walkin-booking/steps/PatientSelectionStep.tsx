'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { User } from '@/types';
import { MagnifyingGlassIcon, UserIcon, CheckCircleIcon, PhoneCallIcon, CalendarBlankIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';

export function PatientSelectionStep() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.patient');
  const {
    currentStep,
    setCurrentStep,
    getStepNumberClass,
    searchPhone,
    setSearchPhone,
    handleSearchPatient,
    showCreateForm,
    setShowCreateForm,
    searchResults,
    selectPatient,
    isSearching,
    selectedPatient
  } = useWalkinBooking();

  return (
    <div className="relative pb-6">
      <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-px bg-slate-200" />
      
      <div className="flex items-start gap-4">
         <div 
           className={`w-8 h-8 rounded-full border-2 text-[13px] font-bold flex items-center justify-center shrink-0 z-10 transition-colors ${getStepNumberClass(1)} ${currentStep > 1 ? 'cursor-pointer hover:shadow-md' : ''}`}
           onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
         >
           1
         </div>
         <div className="flex-1 pt-1.5">
            <div 
               className={`mb-4 ${currentStep > 1 ? 'cursor-pointer hover:opacity-80 inline-block transition-opacity' : ''}`}
               onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
            >
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t('title')}</h3>
                <p className="text-sm text-slate-500 mb-0">{t('desc')}</p>
            </div>

            {currentStep === 1 ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="text-slate-400" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                className="w-full h-11 bg-white border border-slate-200 rounded-xl pl-10 pr-4 text-[14px] focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-shadow shadow-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
                            />
                        </div>
                        <button
                            onClick={handleSearchPatient}
                            disabled={isSearching || !searchPhone.trim()}
                            className="h-11 px-5 bg-[#1570EF] text-white rounded-xl text-sm font-bold hover:bg-[#0F5ED4] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px] cursor-pointer"
                        >
                            {isSearching ? '...' : t('searchBtn')}
                        </button>
                    </div>

                    {!showCreateForm && searchResults.length > 0 && (
                        <div className="space-y-3">
                            {searchResults.map((patient: User) => (
                                <div key={patient.id} className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center gap-4 shadow-sm">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                       {patient.avatar ? (
                                          <Image src={patient.avatar} alt={patient.fullName} width={48} height={48} className="object-cover" />
                                       ) : (
                                          <UserIcon size={24} className="text-slate-400" />
                                       )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-[#1570EF] bg-[#EFF4FF] px-2 py-0.5 rounded-md">ID: {patient.id.slice(0,6).toUpperCase()}</span>
                                            <h4 className="font-bold text-slate-900 truncate">{patient.fullName}</h4>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <PhoneCallIcon size={14} /> {patient.phone}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <CalendarBlankIcon size={14} /> {t('age', { age: 34 })}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => selectPatient(patient)}
                                        className="h-9 px-4 bg-[#1570EF] text-white rounded-lg text-sm font-medium hover:bg-[#0F5ED4] transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                                    >
                                        <CheckCircleIcon className="inline mr-1" size={16} weight="bold"/> {t('selectBtn')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {!showCreateForm && searchPhone && searchResults.length === 0 && !isSearching && (
                         <button
                            onClick={() => setShowCreateForm(true)}
                            className="w-full py-3 bg-white border border-slate-200 border-dashed text-[#1570EF] rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
                         >
                             {t('registerNew', { searchPhone })}
                         </button>
                    )}
                </div>
            ) : (
                selectedPatient && (
                    <div className="bg-white border border-[#1570EF] rounded-xl p-3.5 flex items-center gap-4 shadow-sm w-full max-w-[500px]">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                           <UserIcon size={24} className="text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-[#1570EF] bg-[#EFF4FF] px-2 py-0.5 rounded-md">ID: {selectedPatient.id.slice(0,6).toUpperCase()}</span>
                                <h4 className="font-bold text-slate-900 truncate">{selectedPatient.fullName}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <PhoneCallIcon size={14} /> {selectedPatient.phone}
                                </div>
                            </div>
                        </div>
                        <div className="h-9 px-4 bg-[#1570EF] text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm">
                            <CheckCircleIcon size={16} weight="bold"/> {t('selectedBadge')}
                        </div>
                    </div>
                )
            )}
         </div>
      </div>
    </div>
  );
}
