'use client';

import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';

import { XIcon, BriefcaseIcon, GraduationCapIcon, InfoIcon, PhoneIcon, ShieldCheckIcon, CalendarIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BackendUser } from '@/types';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/utils/helpers';
import { SPECIALTY_STYLES, STATUS_STYLES, type DoctorStatus } from './types';
import { format } from 'date-fns';

interface DoctorDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: BackendUser | null;
}

export function DoctorDetailSheet({ isOpen, onClose, doctor }: DoctorDetailSheetProps) {
  const t = useTranslations('adminDoctors.detailSheet');
  const tTable = useTranslations('adminDoctors.table');

  if (!doctor) return null;

  const doctorStatus = (doctor.isActive ? 'Active' : 'Inactive') as DoctorStatus;
  const statusStyles = STATUS_STYLES[doctorStatus] || STATUS_STYLES.Inactive;
  
  // Extract doctor profile info
  const profile = doctor.doctorProfile;
  const specialties = profile?.specialties || [];
  const qualifications = profile?.qualifications || [];
  const experience = profile?.yearsOfExperience || 0;
  const bio = profile?.bio;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-500 ease-out border-l border-[#e5e7eb]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
            <Dialog.Title className="text-lg font-bold text-[#111518]">
              {t('title')}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button 
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[#f3f4f6] text-[#64748b] transition-colors cursor-pointer"
              >
                <XIcon size={20} />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 space-y-8">
              
              {/* Profile Summary */}
              <div className="flex flex-col items-center text-center space-y-4 pb-4 border-b border-[#f3f4f6]">
                <div className="relative">
                  {doctor.avatar ? (
                    <Image 
                      src={doctor.avatar} 
                      alt={doctor.fullName}
                      width={96}
                      height={96}
                      className="size-24 rounded-full object-cover border-4 border-white shadow-sm"
                    />
                  ) : (
                    <div className="size-24 rounded-full flex items-center justify-center text-3xl font-bold bg-[#1392ec]/10 text-[#1392ec] border-4 border-white shadow-sm">
                      {getInitials(doctor.fullName)}
                    </div>
                  )}
                  <span className={cn(
                    "absolute bottom-1 right-1 size-5 rounded-full border-2 border-white",
                    statusStyles.dot
                  )} />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-[#111518]">{doctor.fullName}</h3>
                  <p className="text-sm text-[#64748b]">{doctor.email}</p>
                </div>

                <span className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
                  statusStyles.wrapper
                )}>
                  <span className={cn('size-1.5 rounded-full', statusStyles.dot)} />
                  {tTable(`statuses.${doctorStatus}`)}
                </span>
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#111518]">
                  <BriefcaseIcon size={18} className="text-[#1392ec]" />
                  <h4 className="font-bold">{t('sections.professional')}</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-4 bg-[#f8fafc] rounded-2xl p-4 border border-[#e5e7eb]">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">{t('fields.specialties')}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {specialties.length > 0 ? specialties.map((s, idx) => (
                        <span 
                          key={idx} 
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium border",
                            SPECIALTY_STYLES[s] || 'bg-gray-100 text-gray-700 border-gray-200'
                          )}
                        >
                          {s}
                        </span>
                      )) : (
                        <span className="text-sm text-[#94a3b8] italic">--</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">{t('fields.experience')}</p>
                    <p className="text-sm font-bold text-[#111518]">
                      {t('fields.years', { count: experience })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">{t('fields.qualifications')}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {qualifications.length > 0 ? qualifications.map((q, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-[#e5e7eb] text-xs text-[#475569]">
                          <GraduationCapIcon size={12} className="text-[#64748b]" />
                          {q}
                        </div>
                      )) : (
                        <span className="text-sm text-[#94a3b8] italic">--</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#111518]">
                  <InfoIcon size={18} className="text-[#1392ec]" />
                  <h4 className="font-bold">{t('sections.about')}</h4>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-[#e5e7eb] text-sm text-[#475569] leading-relaxed">
                  {bio ? (
                    <p className="whitespace-pre-line">{bio}</p>
                  ) : (
                    <p className="text-[#94a3b8] italic">{t('fields.noBio')}</p>
                  )}
                </div>
              </div>

              {/* System Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#111518]">
                  <ShieldCheckIcon size={18} className="text-[#1392ec]" />
                  <h4 className="font-bold">{t('sections.system')}</h4>
                </div>
                
                <div className="divide-y divide-[#f3f4f6] text-sm">
                  <div className="flex justify-between py-3">
                    <span className="text-[#64748b] flex items-center gap-2">
                       <PhoneIcon size={14} /> {t('fields.phone')}
                    </span>
                    <span className="font-bold text-[#111518]">{doctor.phone || '--'}</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-[#64748b] flex items-center gap-2">
                      <ShieldCheckIcon size={14} /> {t('fields.role')}
                    </span>
                    <span className="font-bold text-[#111518] uppercase tracking-tight text-xs bg-slate-100 px-2 py-0.5 rounded italic">
                      {doctor.role}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-[#64748b] flex items-center gap-2">
                      <CalendarIcon size={14} /> {t('fields.joinDate')}
                    </span>
                    <span className="font-medium text-[#111518]">
                      {doctor.createdAt ? format(new Date(doctor.createdAt), 'dd/MM/yyyy') : '--'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
