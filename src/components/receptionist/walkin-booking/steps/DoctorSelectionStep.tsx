'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Doctor } from '@/types';
import { UserIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';

export function DoctorSelectionStep() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.doctor');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    getStepNumberClass,
    doctors,
    selectedDoctor,
    setSelectedDoctor
  } = useWalkinBooking();

  return (
    <div className={`relative pb-6 ${!isStepDone(2) && currentStep !== 3 ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-px bg-slate-200" />

      <div className="flex items-start gap-4">
        <div
          className={`w-8 h-8 rounded-full border-2 text-[13px] font-bold flex items-center justify-center shrink-0 z-10 transition-colors ${getStepNumberClass(3)} ${currentStep > 3 ? 'cursor-pointer hover:shadow-md' : ''}`}
          onClick={() => { if (currentStep > 3) setCurrentStep(3); }}
        >
          3
        </div>
        <div className="flex-1 pt-1.5">
          <div
            className={`mb-4 ${currentStep > 3 ? 'cursor-pointer hover:opacity-80 inline-block transition-opacity' : ''}`}
            onClick={() => { if (currentStep > 3) setCurrentStep(3); }}
          >
            <h3 className="text-lg font-bold text-slate-900 mb-1">{t('title')}</h3>
            <p className="text-sm text-slate-500 mb-0">{t('desc')}</p>
          </div>

          {currentStep === 3 ? (
            <div className="space-y-3 max-w-[500px]">
              {doctors.map((doctor: Doctor) => {
                const isSelected = selectedDoctor?.id === doctor.id;
                return (
                  <div
                    key={doctor.id}
                    className={`border-2 rounded-xl p-3 flex items-center gap-3 transition-all ${isSelected ? 'border-[#1570EF] bg-white ' : 'border-slate-100 bg-white'
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-100 relative">
                      {doctor.avatar ? <Image src={doctor.avatar} alt={doctor.fullName} fill className="object-cover" /> : <UserIcon size={24} className="text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 leading-tight">{doctor.fullName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{doctor.specialties?.[0] || t('generalPractitioner')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[#12B76A] bg-[#ecfdf3] px-2 py-1 rounded-md">{t('available')}</span>
                      <button
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setCurrentStep(4);
                        }}
                        className={`h-9 px-4 rounded-lg text-sm font-bold transition-colors cursor-pointer ${isSelected ? 'bg-[#1570EF] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {isSelected ? t('selectedBtn') : t('selectBtn')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            selectedDoctor && (
              <div className="text-sm font-medium text-slate-900 flex items-center gap-2 border border-slate-200 rounded-lg p-3 w-max pr-8 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#E0E7FF] text-[#3730A3] flex items-center justify-center font-bold overflow-hidden relative border border-slate-200">
                  {selectedDoctor.avatar ? <Image src={selectedDoctor.avatar} alt="" fill className="object-cover" /> : selectedDoctor.fullName[0]}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{selectedDoctor.fullName} <CheckCircleIcon weight="fill" className="text-[#1570EF] inline ml-1" /></span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
