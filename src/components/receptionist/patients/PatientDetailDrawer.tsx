'use client';

import { useEffect, useSyncExternalStore, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import {
  XIcon,
  CameraIcon,
  CakeIcon,
  UserIcon,
  DropIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CalendarPlusIcon,
  PencilSimpleIcon,
  PlusIcon,
  ArrowsVerticalIcon,
  CalculatorIcon,
  ActivityIcon,
  HeartIcon,
  CalendarCheckIcon,
  HandbagIcon,
} from '@phosphor-icons/react';
import { getInitials } from '@/lib/utils/helpers';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type PatientDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  patient: User | null;
  onEdit?: (patient: User) => void;
  onBook?: (patient: User) => void;
};

export function PatientDetailDrawer({
  open,
  onClose,
  patient,
  onEdit,
  onBook,
}: PatientDetailDrawerProps) {
  const isClient = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false,
  );

  const t = useTranslations('receptionistPatients.quickView');

  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: t('tabs.overview') },
    { id: 'medical_records', label: t('tabs.medical_records') },
    { id: 'prescriptions', label: t('tabs.prescriptions') },
    { id: 'lab_results', label: t('tabs.lab_results') },
    { id: 'appointments', label: t('tabs.appointments') },
  ];

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

  const profile = patient.patientProfile;

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
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

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
                <div className="size-24 rounded-xl bg-[#1392ec]/10 text-[#1392ec] flex items-center justify-center text-3xl font-bold font-display shadow-md border-2 border-white dark:border-slate-800">
                  {getInitials(patient.fullName)}
                </div>
              )}
              <button className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-700 size-7 rounded-full shadow-md flex items-center justify-center text-[#1392ec] border border-slate-100 dark:border-slate-600 cursor-pointer">
                <CameraIcon size={14} weight="fill" />
              </button>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{patient.fullName}</h2>
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  patient.isActive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                )}>
                  {patient.isActive ? t('statusActive') : t('statusInactive')}
                </span>
                {profile?.isGuest && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">
                    {t('guestLabel')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1">
                  <CakeIcon size={14} />
                  {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'dd/MM/yyyy') : '—'}
                </span>
                <span className="flex items-center gap-1">
                  <UserIcon size={14} />
                  {patient.gender || '—'}
                </span>
                <span className="flex items-center gap-1">
                  <DropIcon size={14} weight="fill" />
                  {profile?.bloodType || '—'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <PhoneIcon size={14} className="text-[#1392ec]" weight="fill" />
                  <span className="text-slate-600 dark:text-slate-300">{patient.phone || "—"}</span>
                </div>
                {profile?.insuranceNumber && (
                  <div className="flex items-center gap-2 text-xs">
                    <ShieldCheckIcon size={14} className="text-[#1392ec]" weight="fill" />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {profile.insuranceProvider || 'Insurance'} #{profile.insuranceNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                onClick={() => onBook?.(patient)}
                className="px-4 py-2 bg-[#1392ec] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#1392ec]/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarPlusIcon size={16} /> {t('bookAppt')}
              </button>
              <button
                onClick={() => onEdit?.(patient)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <PencilSimpleIcon size={16} /> {t('edit')}
              </button>
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
                    className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === tab.id
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
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Vitals Row - Mock data matching Admin look */}
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800 font-display">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.weight')}</span>
                    <div className="flex items-center gap-1">
                      <HandbagIcon size={18} className="text-[#1392ec] shrink-0" weight="fill" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{profile?.weightKg || '--'} kg</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.height')}</span>
                    <div className="flex items-center gap-1">
                      <ArrowsVerticalIcon size={18} className="text-[#1392ec] shrink-0" weight="bold" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{profile?.heightCm || '--'} cm</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.bmi')}</span>
                    <div className="flex items-center gap-1">
                      <CalculatorIcon size={18} className="text-[#1392ec] shrink-0" weight="fill" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {profile?.weightKg && profile?.heightCm
                          ? (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)
                          : '--'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.bp')}</span>
                    <div className="flex items-center gap-1">
                      <ActivityIcon size={18} className="text-red-500 shrink-0" weight="bold" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">--/--</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl min-w-max flex-1 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 block whitespace-nowrap">{t('vitals.heart')}</span>
                    <div className="flex items-center gap-1">
                      <HeartIcon size={18} className="text-red-500 shrink-0" weight="fill" />
                      <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">-- bpm</span>
                    </div>
                  </div>
                </div>

                {/* Main Content Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-display">

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
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-[10px] rounded-full uppercase tracking-wider">Active</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 p-2 italic">{t('comingSoon.desc')}</p>
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
                          <p className="text-xs text-slate-400 italic">{t('comingSoon.desc')}</p>
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
                      <div className="relative">
                        <div className="absolute -left-6 -translate-x-1/2 top-0 bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-full p-1.5 border-[3px] border-white dark:border-slate-950 flex justify-center items-center">
                          <CalendarCheckIcon size={14} weight="fill" />
                        </div>
                        <div className="flex flex-col -mt-1">
                          <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{t('activity.lastVisitTitle')}</span>
                          <span className="text-xs text-slate-500 mt-1">{t('activity.lastVisitDesc')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'medical_records' && (
              <div className="space-y-4 font-display">
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
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">
                          {t('comingSoon.desc')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab !== 'medical_records' && activeTab !== 'overview' && (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in font-display">
                <span className="text-slate-400 mb-2 font-medium">{t('comingSoon.title')}</span>
                <p className="text-xs text-slate-500">{t('comingSoon.desc')}</p>
              </div>
            )}
          </div>

        </div>
      </aside>
    </div>,
    document.body
  );
}
