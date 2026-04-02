'use client';

import { useTranslations } from 'next-intl';
import { StethoscopeIcon, CheckCircleIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';
import { Service } from '@/types';

export function ServiceSelectionStep() {
  const t = useTranslations('receptionistWalkinBooking.service');
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
              <div className="border-2 border-slate-200 hover:bg-white hover:border-[#1570EF] rounded-2xl p-4 flex items-center gap-5 shadow-xl shadow-[#1570EF]/5 w-full max-w-[600px] animate-in fade-in slide-in-from-top-2 duration-300 relative group overflow-hidden">
                <div className="w-14 h-14 rounded-2xl bg-[#EFF4FF] border-2 border-[#D1E0FF] flex items-center justify-center shrink-0 overflow-hidden shadow-inner font-bold text-[#1570EF]">
                  <StethoscopeIcon size={30} weight="fill" />
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-[12px] font-bold text-[#1570EF] bg-[#EFF4FF] px-2.5 py-1 rounded-lg border border-[#D1E0FF] uppercase shadow-sm">
                      {t('selectedBadge')}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-[17px] truncate tracking-tight">{selectedService.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-slate-600 font-semibold">
                    <span>{Number(selectedService.price).toLocaleString()} VNĐ</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{(selectedService.durationMinutes || 30)} {t('mins')}</span>
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
