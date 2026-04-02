'use client';

import { useTranslations } from 'next-intl';
import { useWalkinBooking } from '../../WalkinBookingContext';

export function CreatePatientForm() {
  const t = useTranslations('receptionistWalkinBooking.patient');
  const {
    newPatient,
    setNewPatient,
    handleCreatePatient,
    isCreatingPatient,
    setShowCreateForm
  } = useWalkinBooking();

  return (
    <form onSubmit={handleCreatePatient} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl shadow-slate-200/50 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h4 className="font-bold text-slate-900 text-[17px]">{t('createProfileTitle')}</h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{t('desc')}</p>
        </div>
        <button 
          type="button" 
          onClick={() => setShowCreateForm(false)} 
          className="text-slate-500 hover:text-slate-700 text-sm font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
        >
          {t('cancelBtn')}
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">{t('accountLevelInfo')} <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setNewPatient({ ...newPatient, isGuest: false })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${!newPatient.isGuest ? 'border-[#1570EF] bg-[#EFF4FF] text-[#1570EF] shadow-md shadow-[#1570EF]/10' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100'}`}
            >
              <span className="text-[13px] font-bold">{t('accountTypeFull')}</span>
            </button>
            <button
              type="button"
              onClick={() => setNewPatient({ ...newPatient, isGuest: true })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${newPatient.isGuest ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md shadow-amber-500/10' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100'}`}
            >
              <span className="text-[13px] font-bold">{t('accountTypeGuest')}</span>
            </button>
          </div>
          <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <p className="text-[12px] text-slate-500 leading-relaxed italic font-medium">
              {!newPatient.isGuest ? t('accountTypeFullDesc') : t('accountTypeGuestDesc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('fullNameLabel')} <span className="text-red-500">*</span></label>
            <input required type="text" value={newPatient.fullName} onChange={(e) => setNewPatient({ ...newPatient, fullName: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all" placeholder={t('fullNamePlaceholder')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('phoneLabel')} <span className="text-red-500">*</span></label>
            <input required type="text" value={newPatient.phone} onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all" placeholder={t('phonePlaceholder')} />
          </div>

          {!newPatient.isGuest && (
            <div className="col-span-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('emailLabel')} <span className="text-red-500">*</span></label>
              <input required={!newPatient.isGuest} type="email" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} className="w-full h-11 px-4 bg-[#EFF4FF]/30 border border-[#D1E0FF] rounded-xl text-[14px] font-semibold focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all" placeholder={t('emailPlaceholder')} />
              <p className="text-[10px] text-[#1570EF] mt-1 font-bold italic">* {t('accountTypeFullDesc').split('.')[0]}.</p>
            </div>
          )}

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('dobLabel')}</label>
            <input type="date" value={newPatient.dateOfBirth} onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all" />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('genderLabel')}</label>
            <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all appearance-none cursor-pointer">
              <option value="MALE">{t('genderMale')}</option>
              <option value="FEMALE">{t('genderFemale')}</option>
              <option value="OTHER">{t('genderOther')}</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('nationalIdLabel')}</label>
            <input type="text" value={newPatient.nationalId} onChange={(e) => setNewPatient({ ...newPatient, nationalId: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all" placeholder={t('nationalIdPlaceholder')} />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('bloodTypeLabel')}</label>
            <select value={newPatient.bloodType} onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all appearance-none cursor-pointer">
              <option value="">{t('bloodTypeUnknown')}</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">{t('addressLabel')}</label>
            <input type="text" value={newPatient.address} onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })} className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-medium focus:outline-none focus:border-[#1570EF] focus:ring-[3px] focus:ring-[#1570EF]/10 transition-all" placeholder={t('addressPlaceholder')} />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isCreatingPatient || !newPatient.fullName || !newPatient.phone || (!newPatient.isGuest && !newPatient.email)} 
          className="w-full mt-2 h-12 bg-[#1570EF] text-white rounded-xl text-[15px] font-extrabold hover:bg-[#0F5ED4] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-lg shadow-[#1570EF]/20 active:scale-[0.99]"
        >
          {isCreatingPatient ? t('submitCreating') : t('submitBtn')}
        </button>
      </div>
    </form>
  );
}
