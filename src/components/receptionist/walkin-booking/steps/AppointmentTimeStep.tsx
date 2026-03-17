'use client';

import { useTranslations } from 'next-intl';
import { useWalkinBooking } from '../WalkinBookingContext';

export function AppointmentTimeStep() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.time');
  const {
    currentStep,
    setCurrentStep,
    isStepDone,
    getStepNumberClass,
    availableSlots,
    selectedSlot,
    selectSlot
  } = useWalkinBooking();

  return (
    <div className={`relative pb-6 ${!isStepDone(3) && currentStep !== 4 ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex items-start gap-4">
         <div 
           className={`w-8 h-8 rounded-full border-2 text-[13px] font-bold flex items-center justify-center shrink-0 z-10 transition-colors ${getStepNumberClass(4)} ${currentStep > 4 ? 'cursor-pointer hover:shadow-md' : ''}`}
           onClick={() => { if (currentStep > 4) setCurrentStep(4); }}
         >
           4
         </div>
         <div className="flex-1 pt-1.5">
            <div 
               className={`mb-4 ${currentStep > 4 ? 'cursor-pointer hover:opacity-80 inline-block transition-opacity' : ''}`}
               onClick={() => { if (currentStep > 4) setCurrentStep(4); }}
            >
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t('title')}</h3>
                <p className="text-sm text-slate-500 mb-0">{t('desc')}</p>
            </div>

             <div className="flex flex-wrap gap-2 max-w-[500px]">
                 {availableSlots.map((slot: string) => {
                     const isSelected = selectedSlot === slot;
                     const isDisabled = slot === '09:00' || slot === '10:30'; // Mock disabled
                     return (
                        <button
                           key={slot}
                           disabled={isDisabled}
                           onClick={() => selectSlot(slot)}
                           className={`w-[70px] h-10 rounded-lg text-[13px] font-bold transition-colors border-2 ${
                               isSelected ? 'border-[#1570EF] bg-white text-[#1570EF]' : 
                               isDisabled ? 'border-transparent bg-slate-50 text-slate-300 cursor-not-allowed' : 
                               'border-slate-200 bg-white text-slate-700 hover:border-[#1570EF]/50 cursor-pointer'
                           }`}
                        >
                           {slot}
                        </button>
                     )
                 })}
             </div>
         </div>
      </div>
    </div>
  );
}
