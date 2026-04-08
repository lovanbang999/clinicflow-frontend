'use client';

import { useTranslations } from 'next-intl';
import { BookingStatus } from '@/types';
import type { QueueRecord } from '@/lib/api/appointment/queue';
import {
  ArrowRightIcon,
  GenderFemaleIcon,
  GenderMaleIcon,
  GenderNeuterIcon,
  ClipboardTextIcon,
  PrinterIcon,
  QueueIcon,
  CalendarBlankIcon,
  ClockIcon,
} from '@phosphor-icons/react';

interface DoctorQueueCardProps {
  item: QueueRecord;
  onCall: (id: string) => void;
  onEnterExam: (id: string) => void;
  onPrint?: (id: string) => void;
  isCallDisabled?: boolean;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

function getAvatarColors(name: string) {
  const colors = [
    { bg: '#1275e2', text: '#ffffff' },
    { bg: '#006c4b', text: '#ffffff' },
    { bg: '#ba1a1a', text: '#ffffff' },
    { bg: '#6b538c', text: '#ffffff' },
    { bg: '#00677e', text: '#ffffff' },
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

export function DoctorQueueCard({ item, onCall, onEnterExam, onPrint, isCallDisabled }: DoctorQueueCardProps) {
  const t = useTranslations('doctorWorkspace.queueView');

  const status = item.booking.status;
  const patient = item.booking.patientProfile;
  const name = patient?.fullName ?? 'N/A';
  const bookingCode = item.booking.bookingCode ?? '';
  const serviceName = item.booking.service?.name ?? '';
  const age = patient?.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : '?';
  const genderStr = patient?.gender === 'MALE' ? t('gender.male') : patient?.gender === 'FEMALE' ? t('gender.female') : t('gender.other');
  
  const initials = getInitials(name);
  const avatarColors = getAvatarColors(name);

  // Status mappings
  let statusBg = 'bg-[#f3f4f9] text-[#44474e] border-[#c4c6cf]/30';
  let statusLbl = t('status.waiting');
  let isOpacified = false;
  let isCrossed = false;

  // Mô hình A — Xác định badge theo serviceId và visitStep
  const hasService = Boolean(item.booking.serviceId);
  const visitStep = item.booking.medicalRecord?.visitStep;
  const isResultsReady = visitStep === 'RESULTS_READY';

  if (status === BookingStatus.IN_PROGRESS) {
    if (isResultsReady) {
      // KTV đã xong, chờ BS đọc kết quả
      statusBg = 'bg-[#dcfce7] text-[#15803d] border-[#86efac]/30';
      statusLbl = t('status.resultsReady', { defaultMessage: 'Có kết quả' });
    } else {
      statusBg = 'bg-[#e0efff] text-[#1275e2] border-[#1275e2]/10';
      statusLbl = t('status.inProgress');
    }
  } else if (status === BookingStatus.CHECKED_IN && !hasService) {
    // Chưa xác định dịch vụ — đang chờ vào phòng tư vấn
    statusBg = 'bg-[#fff7ed] text-[#c2410c] border-[#fb923c]/20';
    statusLbl = t('status.awaitingConsultation', { defaultMessage: 'Chờ tư vấn' });
  } else if (status === BookingStatus.NO_SHOW) {
    isOpacified = true;
    isCrossed = true;
    statusBg = 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/10';
    statusLbl = t('status.noShow');
  } else if (status === BookingStatus.COMPLETED) {
    statusBg = 'bg-[#e0efff] text-[#1275e2] border-[#1275e2]/10';
    statusLbl = t('status.completed');
  } else if (status === BookingStatus.CHECKED_IN) {
    statusBg = 'bg-[#f3f4f9] text-[#44474e] border-[#c4c6cf]/30';
  }

  return (
    <div className={`group bg-white rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#1275e2]/5 border border-[#c4c6cf]/20 relative overflow-hidden ${isOpacified ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Section */}
        <div className="flex items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl"
              style={{ background: isOpacified ? '#f3f4f9' : avatarColors.bg, color: isOpacified ? '#44474e' : avatarColors.text }}
            >
              {initials}
            </div>
            {!isOpacified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#c4c6cf]/20 flex items-center justify-center text-[#1275e2] shadow-sm">
                {patient?.gender === 'FEMALE' ? (
                  <GenderFemaleIcon size={14} weight="bold" />
                ) : patient?.gender === 'MALE' ? (
                  <GenderMaleIcon size={14} weight="bold" />
                ) : (
                  <GenderNeuterIcon size={14} weight="bold" />
                )}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1.5">
              <h4 className={`font-bold text-xl text-[#191c20] ${isCrossed ? 'line-through' : ''}`}>{name}</h4>
              <span className="px-2 py-0.5 rounded-lg bg-[#f3f4f9] text-[#44474e] text-[10px] font-bold tracking-tight border border-[#c4c6cf]/30">
                {bookingCode}
              </span>
              {/* PRE-BOOKED / WALK-IN badge */}
              {item.isPreBooked ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#eff6ff] text-[#1275e2] text-[10px] font-bold border border-[#93c5fd]/60">
                  <CalendarBlankIcon size={10} weight="fill" />
                  Đặt trước
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#f0fdf4] text-[#16a34a] text-[10px] font-bold border border-[#86efac]/60">
                  <QueueIcon size={10} weight="fill" />
                  Walk-in
                </span>
              )}
              {/* Mô hình A — Chờ tư vấn badge khi chưa có dịch vụ */}
              {!hasService && !isOpacified && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#fff7ed] text-[#c2410c] text-[10px] font-bold border border-[#fb923c]/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c]" />
                  Chờ tư vấn
                </span>
              )}
              {/* Có kết quả badge */}
              {isResultsReady && !isOpacified && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#dcfce7] text-[#15803d] text-[10px] font-bold border border-[#86efac]/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]" />
                  Có kết quả
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[#44474e]">
              <div className="flex items-center gap-1.5 text-sm">
                <ClipboardTextIcon size={18} className="opacity-60" weight="fill" />
                <span className="font-medium">{serviceName || t('generalExam')}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-[#c4c6cf] opacity-50" />
              <p className="text-sm font-medium">{age} {t('age')}</p>
              <span className="w-1 h-1 rounded-full bg-[#c4c6cf] opacity-50" />
              <p className="text-sm font-medium">{genderStr}</p>
              {/* Scheduled time (pre-booking) or estimated time (walk-in) */}
              {item.isPreBooked && item.scheduledTime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#c4c6cf] opacity-50" />
                  <div className="flex items-center gap-1 text-sm text-[#1275e2] font-medium">
                    <ClockIcon size={14} weight="fill" />
                    {item.scheduledTime}
                  </div>
                </>
              )}
              {!item.isPreBooked && item.booking.estimatedTime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-[#c4c6cf] opacity-50" />
                  <div className="flex items-center gap-1 text-sm text-[#16a34a] font-medium">
                    <ClockIcon size={14} weight="fill" />
                    ~{new Date(item.booking.estimatedTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </>
              )}
            </div>

            {/* Tags (if any exist on the patient) */}
            {(patient?.allergies || patient?.chronicConditions) && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {patient.allergies && (
                  <span className="px-2 py-1 rounded-md bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
                    {t('tags.allergy')} {patient.allergies}
                  </span>
                )}
                {patient.chronicConditions && (
                  <span className="px-2 py-1 rounded-md bg-[#e2e2e9] text-[#191c20] text-[10px] font-bold">
                    {patient.chronicConditions}
                  </span>
                )}
                {item.booking.medicalRecord && !item.booking.medicalRecord.isFinalized && (
                  <span className="px-2 py-1 rounded-md bg-[#fff7d1] text-[#725a00] text-[10px] font-bold border border-[#725a00]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#725a00] animate-pulse"></span>
                    {t('tags.draft', { defaultMessage: 'Bản nháp' })}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center justify-between sm:justify-end gap-10 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#c4c6cf]/10 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-[#44474e] font-bold uppercase tracking-widest mb-1.5">{t('statusLabel')}</p>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-lg font-bold text-xs border ${statusBg}`}>
              {statusLbl}
            </span>
          </div>

          {status === BookingStatus.IN_PROGRESS ? (
            <button
              onClick={() => onEnterExam(item.booking.id)}
              className="h-12 px-8 rounded-xl bg-[#1275e2] text-white font-bold shadow-lg shadow-[#1275e2]/25 hover:shadow-[#1275e2]/40 active:scale-[0.98] transition-all flex items-center gap-2 group/btn cursor-pointer"
            >
              {t('actions.enterExam')}
              <ArrowRightIcon size={18} className="transition-transform group-hover/btn:translate-x-1" weight="bold" />
            </button>
          ) : status === BookingStatus.CHECKED_IN ? (
            <button
              disabled={isCallDisabled}
              onClick={() => onCall(item.booking.id)}
              className={`h-12 px-8 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all group/btn ${
                isCallDisabled 
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                  : 'bg-white text-[#1275e2] shadow-[#1275e2]/5 border border-[#1275e2]/30 hover:bg-[#e0efff]/50 active:scale-[0.98] cursor-pointer'
              }`}
              title={isCallDisabled ? t('actions.finishCurrentFirst', { defaultMessage: 'Hoàn tất/lưu nháp ca hiện tại trước' }) : ''}
            >
              {!hasService ? t('actions.callConsultation', { defaultMessage: 'Gọi vào tư vấn' }) : t('actions.callPatient')}
              <ArrowRightIcon size={18} className={`transition-transform ${!isCallDisabled ? 'group-hover/btn:translate-x-1' : ''}`} weight="bold" />
            </button>
          ) : status === BookingStatus.COMPLETED ? (
            <button
              onClick={() => onPrint?.(item.booking.id)}
              className="h-12 px-8 rounded-xl bg-[#edf1f8] text-[#1275e2] font-bold border border-[#1275e2]/30 hover:bg-[#e0efff] active:scale-[0.98] transition-all flex items-center gap-2 group/btn cursor-pointer"
            >
              {t('actions.printResult')}
              <PrinterIcon size={18} className="transition-transform group-hover/btn:scale-110" weight="bold" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
