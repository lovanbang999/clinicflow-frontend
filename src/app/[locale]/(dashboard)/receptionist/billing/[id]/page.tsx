'use client';

import {
  CaretLeftIcon,
  PrinterIcon,
  StethoscopeIcon,
  TestTubeIcon,
  PillIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBilling } from '@/lib/hooks/billing/useBilling';
import { InvoiceStatus, PaymentMethod } from '@/lib/api/billing/billing';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentModal } from '@/components/dashboard/billing/PaymentModal';
import { InvoiceServiceList } from '@/components/dashboard/billing/InvoiceServiceList';
import { InvoicePaymentHistory } from '@/components/dashboard/billing/InvoicePaymentHistory';
import { InvoiceSummary } from '@/components/dashboard/billing/InvoiceSummary';
import { InvoicePatientInfo } from '@/components/dashboard/billing/InvoicePatientInfo';
import { useTranslations, useLocale } from 'next-intl';
import { useTicketPrint, TicketData } from '@/lib/hooks/billing/useTicketPrint';
import { PrintableTicket } from '@/components/shared/PrintableTicket';
import { PrintableInvoice } from '@/components/dashboard/billing/PrintableInvoice';
import { InvoiceStatusBadge } from '@/components/dashboard/billing/InvoiceStatusBadge';
import { useLabOrderSocket } from '@/lib/hooks/clinical/useLabOrderSocket';
import { toast } from 'sonner';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const t = useTranslations('receptionistBilling');
  const tTypes = useTranslations('receptionistBilling.bookingInvoices.types');
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;

  const { currentInvoice, loadingInvoice, fetchInvoiceById, addPayment, addItemToInvoice, removeItemFromInvoice } = useBilling();
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const { activeTicket, printTicket } = useTicketPrint();

  const { onBillingRefresh } = useLabOrderSocket();

  useEffect(() => {
    if (id) {
      fetchInvoiceById(id);
    }
  }, [id, fetchInvoiceById]);

  // Real-time refresh when doctor updates lab orders
  useEffect(() => {
    if (!id || !onBillingRefresh) return;

    const unsubscribe = onBillingRefresh((payload) => {
      // If the update is for this invoice's booking, refresh
      if (currentInvoice?.bookingId === payload.bookingId) {
        fetchInvoiceById(id);
        toast.info(t('listRefreshed'), {
          description: t('detail.listRefreshedDescription')
        });
      }
    });

    return () => unsubscribe?.();
  }, [id, onBillingRefresh, currentInvoice?.bookingId, fetchInvoiceById, t]);

  if (loadingInvoice || !currentInvoice) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-40" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  const handlePaymentSubmit = async (
    amount: number,
    method: PaymentMethod,
    labOrderId?: string,
    insuranceCovered?: number,
    insuranceNumber?: string,
  ) => {
    await addPayment(currentInvoice.id, {
      amountPaid: amount,
      paymentMethod: method,
      labOrderId,
      insuranceCovered,
      insuranceNumber,
    });
    fetchInvoiceById(currentInvoice.id); // refresh
  };

  // Map InvoiceType to icon + label
  const invoiceTypeContent: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    CONSULTATION: { label: tTypes('CONSULTATION'), icon: <StethoscopeIcon size={14} weight="bold" />, color: 'text-blue-600 bg-blue-50' },
    LAB: { label: tTypes('LAB'), icon: <TestTubeIcon size={14} weight="bold" />, color: 'text-violet-600 bg-violet-50' },
    PHARMACY: { label: tTypes('PHARMACY'), icon: <PillIcon size={14} weight="bold" />, color: 'text-emerald-600 bg-emerald-50' },
  };
  const typeInfo = invoiceTypeContent[currentInvoice.invoiceType] ?? { label: currentInvoice.invoiceType, icon: null, color: 'text-slate-600 bg-slate-50' };

  return (
    <>
      <div className="mx-auto p-4 sm:p-6 space-y-6 print:hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/receptionist/billing')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <CaretLeftIcon size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                {t('detail.title')} <span className="text-[#1392ec] cursor-pointer">#{currentInvoice.invoiceNumber}</span>
              </h1>
              <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                {t('detail.status')} <InvoiceStatusBadge status={currentInvoice.status} />
                <span className="text-slate-300">|</span>
                {t('detail.createdAt')} {format(new Date(currentInvoice.createdAt), 'HH:mm - dd/MM/yyyy', { locale: dateLocale })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* InvoiceType badge */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
              {typeInfo.icon}
              {typeInfo.label}
            </span>

            <div className="flex items-center gap-2 ml-4">
              {(currentInvoice.status === InvoiceStatus.DRAFT || currentInvoice.status === InvoiceStatus.OPEN) && (() => {
                const medicalRecord = currentInvoice.booking?.medicalRecord;
                const allowedSteps = [
                  'SERVICES_ORDERED',
                  'AWAITING_RESULTS',
                  'RESULTS_READY',
                  'DIAGNOSED',
                  'PRESCRIBED',
                  'COMPLETED'
                ];
                const isConsultationDone = medicalRecord && allowedSteps.includes(medicalRecord.visitStep);
                const isAwaitingResults = currentInvoice.booking?.status === 'AWAITING_RESULTS';

                if (currentInvoice.invoiceType === 'CONSULTATION' && !isConsultationDone && !isAwaitingResults) {
                  return (
                    <Button
                      disabled
                      title={t('detail.notFinishedTooltip')}
                      className="bg-slate-200 text-slate-500 cursor-not-allowed opacity-80 border-0"
                    >
                      {t('detail.statusNotFinished')}
                    </Button>
                  );
                }

                return (
                  <Button
                    onClick={() => setPaymentModalOpen(true)}
                    className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white cursor-pointer"
                  >
                    {t('detail.payBtn')}
                  </Button>
                );
              })()}
            </div>

            {currentInvoice.status === InvoiceStatus.PAID && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="hidden sm:flex border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer"
                  onClick={() => window.print()}
                >
                  <PrinterIcon size={18} className="mr-2" /> {t('detail.printBtn')}
                </Button>

                {currentInvoice.invoiceType !== 'CONSULTATION' && (
                  <Button
                    variant="outline"
                    className="border-[#1392ec] text-[#1392ec] hover:bg-[#1392ec]/10 cursor-pointer"
                    onClick={() => {
                      // Print tickets for all items
                      const booking = currentInvoice.booking;
                      currentInvoice.items.forEach((item, index) => {
                        const data: TicketData = {
                          patientName: booking?.patientProfile?.fullName || 'N/A',
                          patientCode: booking?.patientProfile?.patientCode || 'N/A',
                          // Try to get queue number from various sources
                          queueNumber: item.labOrder?.queueNumber ||
                            item.visitServiceOrder?.queueNumber ||
                            booking?.queueRecord?.queuePosition ||
                            index + 1, // Fallback to index if no position 
                          roomName: item.labOrder?.roomName ||
                            (item.visitServiceOrder ? t('detail.specialistRoom') : booking?.room?.name) ||
                            t('detail.generalRoom'),
                          doctorName: item.visitServiceOrder?.performer?.fullName || booking?.doctor?.fullName,
                          serviceName: item.itemName,
                          type: item.labOrder ? 'LAB' : 'CONSULTATION',
                          date: new Date(),
                        };
                        printTicket(data);
                      });
                    }}
                  >
                    <PrinterIcon size={18} className="mr-2" /> {t('detail.printTicketBtn')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Items & Payments */}
          <div className="lg:col-span-2 space-y-6">
            <InvoiceServiceList
              invoice={currentInvoice}
              onAddItem={async (itemName, unitPrice, quantity) => {
                await addItemToInvoice(currentInvoice.id, { itemName, unitPrice, quantity });
                fetchInvoiceById(currentInvoice.id);
              }}
              onRemoveItem={async (itemId) => {
                await removeItemFromInvoice(currentInvoice.id, itemId);
                fetchInvoiceById(currentInvoice.id);
              }}
            />
            <InvoicePaymentHistory invoice={currentInvoice} />
          </div>

          {/* Right Column: Summary & Patient Info */}
          <div className="space-y-6">
            <InvoiceSummary invoice={currentInvoice} />
            <InvoicePatientInfo invoice={currentInvoice} />
          </div>
        </div>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          invoice={currentInvoice}
          onPaymentSubmitted={handlePaymentSubmit}
        />
      </div>

      {/* Area for printing only - hidden by default on screen */}
      <PrintableInvoice invoice={currentInvoice} />
      <PrintableTicket ticket={activeTicket} />
    </>
  );
}
