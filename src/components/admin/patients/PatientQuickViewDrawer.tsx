'use client';

import { useEffect, useSyncExternalStore, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { medicalRecordsApi, PatientHistoryResponse } from '@/lib/api/medical-records';
import {
  XIcon,
  CameraIcon,
  CakeIcon,
  UserIcon,
  DropIcon,
  PhoneIcon,
  ShieldCheckIcon,
  PlusIcon,
  EyeIcon,
  ArrowsVerticalIcon,
  CalculatorIcon,
  ActivityIcon,
  HeartIcon,
  CalendarCheckIcon,
  CircleNotchIcon,
} from '@phosphor-icons/react';
import { getInitials } from '@/lib/utils/helpers';
import type { PatientRow } from '@/components/admin/patients/PatientTable';

type PatientQuickViewDrawerProps = {
  open: boolean;
  onClose: () => void;
  patient: PatientRow | null;
};

export function PatientQuickViewDrawer({
  open,
  onClose,
  patient,
}: PatientQuickViewDrawerProps) {
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const t = useTranslations('adminPatients.quickView');

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: t('tabs.overview') },
    { id: 'medical_records', label: t('tabs.medical_records') },
    { id: 'prescriptions', label: t('tabs.prescriptions') },
    { id: 'lab_results', label: t('tabs.lab_results') },
    { id: 'appointments', label: t('tabs.appointments') },
  ];

  const [history, setHistory] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchHistory() {
      if (!open || !patient?.id) {
        setHistory(null);
        return;
      }

      setLoading(true);
      try {
        const data = await medicalRecordsApi.getPatientHistory(patient.id);
        if (!ignore) {
          setHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch patient history:', error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, [open, patient?.id]);

  const profile = history?.patientProfile;
  const visits = history?.visits || [];


  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!isClient || !open || !patient) return null;

  return createPortal(
    <div className="z-[100] relative">
      {/* Quick View Drawer Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Quick View Drawer */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white dark:bg-slate-950 z-50 shadow-2xl flex flex-col transform transition-transform border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950 sticky top-0 z-10">
          <h3 className="font-bold text-slate-900 dark:text-white">{t('title')}</h3>
          <button 
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          >
            <XIcon size={20} weight="bold" />
          </button>
        </div>

        {/* Drawer Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Patient Header Info */}
          <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              {patient.avatar ? (
                <Image
                  src={patient.avatar}
                  alt={patient.fullName}
                  width={96}
                  height={96}
                  className="size-24 rounded-xl object-cover shadow-md border-2 border-white dark:border-slate-800"
                />
              ) : (
                <div className="size-24 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold font-display shadow-md border-2 border-white dark:border-slate-800">
                  {getInitials(patient.fullName)}
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-700 size-7 rounded-full shadow-md flex items-center justify-center text-[#1392ec] border border-slate-100 dark:border-slate-600">
                <CameraIcon size={14} weight="fill" />
              </button>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{patient.fullName}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  patient.status === 'active' || patient.isActive 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : patient.status === 'pending'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {t(`status.${patient.status || (patient.isActive ? 'active' : 'inactive')}`).toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><CakeIcon size={14} /> {patient.dateOfBirth || "—"}</span>
                <span className="flex items-center gap-1"><UserIcon size={14} /> {patient.gender || "—"}</span>
                <span className="flex items-center gap-1"><DropIcon size={14} weight="fill" /> {patient.bloodType || "—"}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <PhoneIcon size={14} className="text-[#1392ec]" weight="fill" />
                  <span className="text-slate-600 dark:text-slate-300">{patient.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <ShieldCheckIcon size={14} className="text-[#1392ec]" weight="fill" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">SmartClinic #{profile?.patientCode || patient.id.substring(0, 6)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs */}
          <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
              <div className="flex gap-6 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-[#1392ec] text-[#1392ec]'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content Rendering */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <CircleNotchIcon size={32} className="text-[#1392ec] animate-spin" />
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                {/* Vitals Row */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.weight')}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{profile?.weightKg ? `${profile.weightKg} kg` : '—'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.height')}</span>
                    <div className="flex items-center gap-1">
                      <ArrowsVerticalIcon size={18} className="text-[#1392ec] shrink-0" weight="bold" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{profile?.heightCm ? `${profile.heightCm} cm` : '—'}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.bmi')}</span>
                    <div className="flex items-center gap-1">
                      <CalculatorIcon size={18} className="text-[#1392ec] shrink-0" weight="fill" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {profile?.weightKg && profile?.heightCm 
                          ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)
                          : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.bp')}</span>
                    <div className="flex items-center gap-1">
                      <ActivityIcon size={18} className="text-red-500 shrink-0" weight="bold" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">—</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.heart')}</span>
                    <div className="flex items-center gap-1">
                      <HeartIcon size={18} className="text-red-500 shrink-0" weight="fill" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">—</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Left Column */}
                  <div className="space-y-8">
                    {/* Active Conditions */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="size-1.5 rounded-full bg-[#1392ec]"></div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t('conditions.title')}</h4>
                      </div>
                      <div className="space-y-3">
                        {profile?.chronicConditions ? (
                          profile.chronicConditions.split(',').map((condition, idx) => (
                            <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex justify-between items-center shadow-sm">
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{condition.trim()}</span>
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 font-bold text-[10px] rounded-full uppercase tracking-wider">{t('status.active')}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500 italic">{t('conditions.empty')}</div>
                        )}
                      </div>
                    </div>

                    {/* Allergies & Risks */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="size-1.5 rounded-full bg-red-500"></div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t('allergies.title')}</h4>
                      </div>
                      <div className="bg-red-50/50 dark:bg-red-500/5 border border-red-50 dark:border-red-900/50 rounded-2xl p-4 flex flex-wrap gap-2">
                        {profile?.allergies ? (
                          profile.allergies.split(',').map((allergy, idx) => (
                            <span key={idx} className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-1 rounded-lg text-xs font-semibold shadow-sm">
                              {allergy.trim()}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-red-500/70 italic">{t('allergies.empty')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="size-1.5 rounded-full bg-amber-500"></div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">{t('activity.title')}</h4>
                    </div>
                    
                    <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6 pt-2 pb-2 mt-2">
                      {visits.length > 0 ? visits.slice(0, 3).map((visit, idx) => (
                        <div key={idx} className="relative border border-transparent">
                          <div className="absolute -left-6 -translate-x-1/2 top-0 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full p-1.5 border-[3px] border-white dark:border-slate-950 flex justify-center items-center">
                            <CalendarCheckIcon size={14} weight="fill" />
                          </div>
                          <div className="flex flex-col -mt-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{visit.booking?.service?.name ?? '—'}</span>
                            <span className="text-xs text-slate-500 mt-1">{new Date(visit.booking?.bookingDate ?? visit.createdAt).toLocaleDateString()} &bull; {visit.booking?.doctor?.fullName}</span>
                            
                            {visit.prescription && visit.prescription.items.length > 0 && (
                              <div className="mt-2 text-xs text-slate-500">
                                <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">{t('prescriptions.label')}</span>
                                {visit.prescription.items.map(i => i.medicineName).join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="text-sm text-slate-500 italic">{t('activity.empty')}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'medical_records' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('medicalRecords.title')}</h4>
                  <button className="text-[#1392ec] text-xs font-bold flex items-center gap-1 hover:text-[#1392ec]/80 transition-colors cursor-pointer">
                    <PlusIcon size={14} weight="bold" /> {t('medicalRecords.add')}
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                      <tr className="text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                        <th className="px-4 py-3">{t('medicalRecords.columns.date')}</th>
                        <th className="px-4 py-3">{t('medicalRecords.columns.diagnosis')}</th>
                        <th className="px-4 py-3 text-right">{t('medicalRecords.columns.action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {visits.filter(v => v.diagnosisName).length > 0 ? visits.filter(v => v.diagnosisName).map((visit, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30">
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">{new Date(visit.booking?.bookingDate ?? visit.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:text-slate-300 dark:bg-slate-800">{visit.diagnosisName || t('medicalRecords.defaultDiagnosis')}</span></td>
                          <td className="px-4 py-3 text-right">
                            <button className="text-slate-400 hover:text-[#1392ec] transition-colors cursor-pointer">
                              <EyeIcon size={16} />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-sm text-slate-500 italic">{t('medicalRecords.empty')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'prescriptions' && (
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('prescriptions.title')}</h4>
                <div className="space-y-3">
                  {visits.filter(v => v.prescription).length > 0 ? visits.filter(v => v.prescription).map((visit, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500">{new Date(visit.booking?.bookingDate ?? visit.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-[#1392ec] uppercase">{visit.booking?.doctor?.fullName}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {visit.prescription?.items.map((item, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-xs text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">
                            {item.medicineName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="text-sm text-slate-500 italic p-8 text-center border border-dashed rounded-xl">{t('prescriptions.empty')}</div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab !== 'medical_records' && activeTab !== 'overview' && activeTab !== 'prescriptions' && (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in">
                <span className="text-slate-400 mb-2 font-medium">{t('comingSoon.title')}</span>
                <p className="text-xs text-slate-500">{t('comingSoon.desc')}</p>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
