'use client';

import { useTranslations } from 'next-intl';
import {
  CheckCircleIcon,
  PrinterIcon,
  QueueIcon,
  ClockIcon,
  UserIcon,
  PlusIcon,
  MapPinIcon,
  CreditCardIcon,
  TestTubeIcon,
} from '@phosphor-icons/react';
import { useWalkinBooking } from '../WalkinBookingContext';
import { format } from 'date-fns';
import { PrintableWalkinTicket } from '../PrintableWalkinTicket';
import { useRouter, useParams } from 'next/navigation';

export function CompletedBooking() {
  const t = useTranslations('receptionistWalkinBooking.success');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) ?? 'vi';
  const {
    selectedPatient, selectedDoctor, completedBooking, completedQueue,
    handleReset, bookingMode, selectedServices, dutyDoctor,
  } = useWalkinBooking();

  const isModeB = bookingMode === 'DIRECT_SERVICE';

  const isPending = completedBooking?.status === 'PENDING';

  return (
    <div className="max-w-lg mx-auto mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Success Header */}
      <div className="text-center mb-6">
        <div className={`w-16 h-16 ${isPending ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'} border-2 rounded-full flex items-center justify-center mx-auto mb-4`}>
          <CheckCircleIcon size={36} weight="fill" className={isPending ? 'text-blue-500' : 'text-emerald-500'} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          {isPending ? t('pendingTitle') : t('title')}
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          {isPending ? t('pendingMessage') : t('message')}
        </p>
      </div>

      {/* Queue Ticket Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden mb-5">
        {/* Ticket Header */}
        <div className={`${isPending ? 'bg-slate-700' : 'bg-[#1570EF]'} px-6 py-5 text-white transition-colors duration-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-1">{t('clinicName')}</p>
              <p className="text-sm text-blue-100">{t('receiptTitle')}</p>
            </div>
            {completedQueue && !isPending && (
              <div className="text-right">
                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">{t('queueNumber')}</p>
                <div className="flex items-center justify-end gap-2">
                  <QueueIcon size={20} weight="fill" className="text-blue-200" />
                  <span className="text-4xl font-black">{completedQueue.queuePosition}</span>
                </div>
              </div>
            )}
            {isPending && (
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{t('statusLabel')}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {t('pendingStatus')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Ticket Dashed Divider */}
        <div className="relative px-6 py-0">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50" />
          <div className="border-t-2 border-dashed border-slate-200 py-0" />
        </div>

        {/* Ticket Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Patient */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <UserIcon size={18} className="text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('patientLabel')}</p>
              <p className="font-bold text-slate-900 truncate">{selectedPatient?.fullName ?? '—'}</p>
            </div>
          </div>

          {/* Doctor OR Services depending on mode */}
          {isModeB ? (
            /* Mode B: show services list */
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0">
                <TestTubeIcon size={18} className="text-[#1570EF]" weight="fill" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('doctorLabel')} phụ trách · Dịch vụ</p>
                <p className="font-bold text-slate-900 truncate">{dutyDoctor?.fullName ?? '—'}</p>
                <div className="mt-1 space-y-0.5">
                  {selectedServices.slice(0, 3).map(s => (
                    <p key={s.id} className="text-[11px] text-slate-500 truncate">· {s.name}</p>
                  ))}
                  {selectedServices.length > 3 && (
                    <p className="text-[11px] text-slate-400">+{selectedServices.length - 3} dịch vụ khác</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Mode A: show consultation doctor */
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <UserIcon size={18} className="text-slate-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('doctorLabel')}</p>
                <p className="font-bold text-slate-900 truncate">{selectedDoctor?.fullName ?? '—'}</p>
              </div>
            </div>
          )}

          {/* Clinic Room - Only show if not pending or if room actually assigned */}
          {completedBooking?.room && !isPending && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <MapPinIcon size={18} weight="fill" className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('roomLabel')}</p>
                <p className="font-bold text-slate-900 truncate">{completedBooking.room.name}</p>
              </div>
            </div>
          )}

          {/* Booking Code */}
          {completedBooking?.bookingCode && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF4FF] flex items-center justify-center shrink-0">
                <span className="text-[#1570EF] font-black text-sm">#</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('bookingCodeLabel')}</p>
                <p className="font-mono font-bold text-slate-900">{completedBooking.bookingCode}</p>
              </div>
            </div>
          )}

          {/* Wait Time - Hide for pending */}
          {completedQueue?.estimatedWaitMinutes !== undefined && !isPending && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <ClockIcon size={18} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{t('estimatedWait')}</p>
                <p className="font-bold text-slate-900">~{completedQueue.estimatedWaitMinutes} {t('minutes')}</p>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <ClockIcon size={18} className="text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                {isPending ? t('appointmentTimeLabel') : t('dateLabel')}
              </p>
              <p className="font-bold text-slate-900">
                {isPending 
                  ? format(new Date(completedBooking?.bookingDate || new Date()), 'dd/MM/yyyy') + ' — ' + (completedBooking?.startTime || '--:--')
                  : format(new Date(), 'dd/MM/yyyy — HH:mm')}
              </p>
            </div>
          </div>
        </div>

        {/* Room Info Banner - Hide for pending */}
        {!isPending && (
          <div className="bg-amber-50 border-t border-amber-100 px-6 py-3 flex items-center gap-2">
            <QueueIcon size={16} className="text-amber-600 shrink-0" weight="fill" />
            <p className="text-xs font-semibold text-amber-800">{t('waitingRoomInfo')}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {!isPending && !isModeB && (
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-[#1570EF] text-[#1570EF] py-3 rounded-xl font-bold hover:bg-[#EFF4FF] transition-all cursor-pointer"
          >
            <PrinterIcon size={18} />
            {t('printBtn')}
          </button>
        )}
        {/* Mode B: Go to Billing */}
        {isModeB && completedBooking && (
          <button
            onClick={() => router.push(`/${locale}/receptionist/billing?bookingId=${completedBooking.id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1570EF] text-white py-3 rounded-xl font-bold hover:bg-[#1165D8] transition-all shadow-lg shadow-[#1570EF]/20 cursor-pointer"
          >
            <CreditCardIcon size={18} />
            {t('goToBillingBtn')}
          </button>
        )}
        <button
          onClick={handleReset}
          className="flex-1 flex items-center justify-center gap-2 bg-[#1570EF] text-white py-3 rounded-xl font-bold hover:bg-[#1165D8] transition-all shadow-lg shadow-[#1570EF]/20 cursor-pointer"
        >
          <PlusIcon size={18} />
          {t('newBookingBtn')}
        </button>
      </div>

      {/* Note about billing */}
      <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed">
        {isModeB ? t('directServiceNote') : isPending ? t('pendingNote') : t('billingNote')}
      </p>

      {/* Printable Area - Hidden on screen */}
      {completedBooking && !isModeB && (
        <PrintableWalkinTicket 
          booking={completedBooking} 
          queue={completedQueue || undefined} 
        />
      )}
    </div>
  );
}
