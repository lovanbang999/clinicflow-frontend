'use client';

import { useTranslations } from 'next-intl';
import { useWalkinBooking } from '../WalkinBookingContext';
import { SearchSection } from './patient-selection/SearchSection';
import { PatientCard } from './patient-selection/PatientCard';
import { Pagination } from './patient-selection/Pagination';
import { PatientNotFound } from './patient-selection/PatientNotFound';
import { CreatePatientForm } from './patient-selection/CreatePatientForm';
import { SelectedPatientProfile } from './patient-selection/SelectedPatientProfile';

export function PatientSelectionStep() {
  const t = useTranslations('dashboard.receptionist.walkinBookingForm.patient');
  const {
    currentStep,
    setCurrentStep,
    getStepNumberClass,
    showCreateForm,
    searchResults,
    searchQuery,
    isSearching
  } = useWalkinBooking();

  return (
    <div className="relative pb-6">
      <div className="absolute left-[15px] top-[32px] bottom-[-24px] w-px bg-slate-200" />
      <div className="flex items-start gap-4">
        <div
          className={`w-8 h-8 rounded-full border-2 text-[13px] font-extrabold flex items-center justify-center shrink-0 z-10 transition-all duration-300 shadow-sm ${getStepNumberClass(1)} ${currentStep > 1 ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}`}
          onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
        >
          1
        </div>
        <div className="flex-1 pt-1.5 min-w-0">
          <div
            className={`mb-6 transition-all duration-300 ${currentStep > 1 ? 'cursor-pointer hover:opacity-70 inline-block' : ''}`}
            onClick={() => { if (currentStep > 1) setCurrentStep(1); }}
          >
            <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{t('title')}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{t('desc')}</p>
          </div>

          {currentStep === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              {/* Search and Action Bar */}
              <SearchSection />

              {/* Patient Results List */}
              {!showCreateForm && searchResults.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-400">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1 h-3 bg-[#1570EF] rounded-full" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {searchQuery ? t('searchResults') : t('patientList')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3.5">
                    {searchResults.map((patient) => (
                      <PatientCard key={patient.id} patient={patient} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination />
                </div>
              )}

              {/* Empty State / Not Found */}
              {!showCreateForm && searchQuery && searchResults.length === 0 && !isSearching && (
                <PatientNotFound />
              )}

              {/* Registration Form */}
              {showCreateForm && (
                <CreatePatientForm />
              )}
            </div>
          ) : (
            /* Compact Selected View */
            <SelectedPatientProfile />
          )}
        </div>
      </div>
    </div>
  );
}
