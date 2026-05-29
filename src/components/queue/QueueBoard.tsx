'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  UsersIcon,
  ClockIcon,
  ArrowRightIcon,
  TimerIcon,
  ProhibitIcon,
  CheckIcon,
  PrinterIcon
} from '@phosphor-icons/react';
import { QueueRecord } from '@/lib/api/appointment/queue';
import { PrintableWalkinTicket } from '@/components/receptionist/walkin-booking/PrintableWalkinTicket';
import { useTicketPrint, TicketData } from '@/lib/hooks/billing/useTicketPrint';
import { PrintableTicket } from '@/components/shared/PrintableTicket';
import { InvoiceStatus } from '@/lib/api/billing/billing';
import { MoneyIcon } from '@phosphor-icons/react';
import { useQueue } from '@/lib/hooks/appointment/useQueue';
import { BookingStatus } from '@/types';

interface QueueBoardProps {
  doctorId?: string;
  doctorName?: string;
  isDoctorView?: boolean;
}

export function QueueBoard({ doctorId, doctorName, isDoctorView = false }: QueueBoardProps) {
  const t = useTranslations('receptionistQueue.board');

  const {
    queueItems,
    stats,
    isLoading,
    isConnected,
    callPatient,
    markNoShow
  } = useQueue(doctorId);

  const {
    activeTicket,
    printTicket,
  } = useTicketPrint();

  // Legacy printing state for walk-in tickets (pre-refactor compat)
  const [printingItem, setPrintingItem] = useState<QueueRecord | null>(null);

  useEffect(() => {
    if (printingItem) {
      const timer = setTimeout(() => {
        window.print();
        setPrintingItem(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [printingItem]);

  const handleCallPatient = async (bookingId: string) => {
    await callPatient(bookingId);
  };

  const handleMarkNoShow = async (bookingId: string) => {
    if (!window.confirm(t('markNoShow') + '?')) return;
    await markNoShow(bookingId);
  };

  const handleCompleteVisit = async () => {
    // Note: completion is now typically handled via the EMR form in the doctor workspace.
    // If called from here (e.g. receptionist view), we might want different behavior,
    // but we're removing the doctor-specific redirection to the consultation page.
  };

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CHECKED_IN:
        return { color: 'bg-blue-100 text-blue-700 font-bold border-blue-200', text: t('status.waiting') };
      case BookingStatus.IN_PROGRESS:
        return { color: 'bg-emerald-100 text-emerald-700 font-bold border-emerald-200 animate-pulse', text: t('status.examining') };
      case BookingStatus.COMPLETED:
        return { color: 'bg-slate-100 text-slate-500 font-medium border-slate-200', text: t('status.completed') };
      case BookingStatus.NO_SHOW:
        return { color: 'bg-rose-50 text-rose-600 font-bold border-rose-100', text: t('status.noShow') };
      default:
        // Try translating via status key if defined
        return { color: 'bg-slate-50 text-slate-400', text: status };
    }
  };

  if (!doctorId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-50/50 rounded-3xl border border-dashed border-slate-300 p-8 text-center mt-4">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
          <UsersIcon size={32} className="text-slate-400" />
        </div>
        <p className="text-slate-600 font-medium">{t('selectDoctor')}</p>
        <p className="text-slate-400 text-sm mt-1">{t('selectDoctorDesc')}</p>
      </div>
    );
  }

  const inProgressItems = Array.isArray(queueItems) ? queueItems.filter(item => item.booking.status === BookingStatus.IN_PROGRESS) : [];
  const waitingItems = Array.isArray(queueItems) ? queueItems.filter(item => item.booking.status !== BookingStatus.IN_PROGRESS && item.booking.status !== BookingStatus.COMPLETED) : [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <UsersIcon size={80} weight="fill" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <UsersIcon size={24} weight="fill" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{t('stats.totalInQueue')}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-slate-900">{stats?.totalQueued || 0}</p>
                <span className="text-sm text-slate-400 font-medium mt-1 pr-2">{t('patientsUnit')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm col-span-2 flex items-center gap-4 relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
            <ClockIcon size={24} weight="fill" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">{t('stats.avgWaitTime')}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-900">{stats?.averageWaitTimeMinutes || 0}</p>
              <span className="text-sm text-slate-400 font-medium mt-1 pr-2">{t('timeUnit.minutes')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Currently Serving (Dominant Card) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20" />
              {doctorName ? `${t('inExamLabel')} - ${doctorName}` : t('inExamLabel')}
            </h3>
            {isConnected ? (
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{t('live')}</span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{t('offline')}</span>
            )}
          </div>

          {isLoading ? (
            <div className="bg-slate-50 h-40 rounded-2xl border-2 border-slate-100 animate-pulse" />
          ) : inProgressItems.length > 0 ? (
            <div className="space-y-3">
              {inProgressItems.map(item => (
                <div key={item.id} className="bg-gradient-to-b from-emerald-50 to-white p-5 rounded-2xl border-2 border-emerald-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500">
                    <UsersIcon size={120} weight="fill" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl text-lg font-black bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                        {item.queuePosition}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md uppercase tracking-wide">
                        {t('inRoom')}
                      </span>
                    </div>
                    <p className="font-extrabold text-lg text-slate-900 truncate">
                      {item.booking.patientProfile?.fullName || 'N/A'}
                    </p>
                    <p className="text-sm font-medium text-emerald-600/80 mt-1 flex items-center gap-1.5">
                      <CheckIcon size={16} weight="bold" />
                      Code: {item.booking.bookingCode}
                    </p>

                    {isDoctorView && (
                      <div className="mt-5">
                        <button
                          onClick={() => handleCompleteVisit()}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {t('completeVisit')}
                          <CheckIcon size={16} weight="bold" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[160px]">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <CheckIcon size={24} className="text-slate-300" weight="bold" />
              </div>
              <p className="font-medium text-slate-500">{t('emptyClinic')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('waitingForNext')}</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Waiting List Table */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <h3 className="font-bold text-slate-800 mb-4 pb-1 border-b border-transparent">{t('waitingList')} ({waitingItems.length})</h3>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">
                    <th className="px-5 py-3 w-16 text-center">STT</th>
                    <th className="px-5 py-3">{t('table.patient')}</th>
                    <th className="px-5 py-3">{t('table.status')}</th>
                    <th className="px-5 py-3">{t('table.waitTime')}</th>
                    <th className="px-5 py-3">{t('table.payment')}</th>
                    <th className="px-5 py-3 text-right">{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2 text-sm font-medium">
                          <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          {t('loadingList')}
                        </div>
                      </td>
                    </tr>
                  ) : waitingItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                        <p className="text-sm font-medium">{t('noData')}</p>
                      </td>
                    </tr>
                  ) : (
                    waitingItems.map((item) => {
                      const statusConfig = getStatusConfig(item.booking.status);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex w-8 h-8 items-center justify-center rounded-lg text-sm font-bold bg-slate-100 text-slate-600 group-hover:bg-slate-200 transition-colors`}>
                              {item.queuePosition}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{item.booking.patientProfile?.fullName || 'N/A'}</p>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">{item.booking.bookingCode}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wide border font-bold ${statusConfig.color}`}>
                              {statusConfig.text}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                              <TimerIcon size={16} />
                              <span className="text-xs">{t('estimatedTime', { time: item.estimatedWaitMinutes })}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {(() => {
                              const booking = item.booking;
                              const invoices = booking.invoices || [];
                              const hasUnpaid = invoices.some(
                                (inv) => inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED
                              );

                              if (hasUnpaid) {
                                return (
                                  <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 w-fit">
                                    <MoneyIcon size={14} weight="bold" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{t('table.pendingPayment')}</span>
                                  </div>
                                );
                              }

                              if (invoices.length > 0) {
                                return (
                                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">
                                    <CheckIcon size={14} weight="bold" />
                                    <span className="text-[10px] font-bold uppercase tracking-tight">{t('table.paid')}</span>
                                  </div>
                                );
                              }

                              return <span className="text-[10px] text-slate-300 italic">N/A</span>;
                            })()}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center gap-2 justify-end">
                              {isDoctorView && item.booking.status === BookingStatus.CHECKED_IN && (
                                <button
                                  onClick={() => handleCallPatient(item.booking.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                >
                                  {t('callPatient')}
                                  <ArrowRightIcon size={14} weight="bold" />
                                </button>
                              )}

                              {item.booking.status === BookingStatus.CHECKED_IN && (
                                <button
                                  onClick={() => handleMarkNoShow(item.booking.id)}
                                  className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors cursor-pointer"
                                  title={t('markNoShow')}
                                >
                                  <ProhibitIcon size={18} weight="bold" />
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  const booking = item.booking;
                                  const data: TicketData = {
                                    patientName: booking.patientProfile?.fullName || 'N/A',
                                    patientCode: booking.patientProfile?.patientCode || 'N/A',
                                    doctorName: doctorName,
                                    items: [{
                                      serviceName: booking.service?.name || t('consultationService'),
                                      roomName: booking.room?.name || doctorName || t('clinicRoom'),
                                      queueNumber: item.queuePosition,
                                      type: 'CONSULTATION',
                                    }],
                                    date: new Date(),
                                  };
                                  printTicket(data);
                                }}
                                className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-md transition-colors cursor-pointer"
                                title={t('printTicket')}
                              >
                                <PrinterIcon size={18} weight="bold" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Area - Hidden on screen */}
      <PrintableTicket ticket={activeTicket} />

      {/* Legacy Printable Area */}
      {printingItem && (
        <PrintableWalkinTicket
          booking={printingItem.booking}
          queue={{ queuePosition: printingItem.queuePosition }}
        />
      )}
    </div>
  );
}
