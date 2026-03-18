'use client';

import { useTranslations } from 'next-intl';
import { StethoscopeIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';
import { Service } from '@/types';

export function ServiceSelectionStep() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.service');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    getStepNumberClass,
    services,
    selectedService,
    selectService
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service: Service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => selectService(service)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-[#1570EF] bg-[#EFF4FF]' : 'border-slate-100 bg-white hover:border-[#1570EF]/30 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#1570EF] text-white' : 'bg-slate-50 text-slate-400'}`}>
                        <StethoscopeIcon size={20} weight={isSelected ? "fill" : "regular"} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{service.name}</h4>
                        <p className="text-xs text-slate-500">{service.price} VNĐ • {(service.durationMinutes || 30)} {t('mins')}</p>
                      </div>
                      {isSelected && <CheckCircleIcon size={20} weight="fill" className="text-[#1570EF] shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            selectedService && (
              <div className="text-sm font-medium text-slate-900 flex items-center gap-2 border border-slate-200 rounded-lg p-3 w-max pr-8 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-[#EFF4FF] flex items-center justify-center text-[#1570EF]">
                  <StethoscopeIcon size={16} weight="fill" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold">{selectedService.name} <CheckCircleIcon weight="fill" className="text-[#1570EF] inline ml-1" /></span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
