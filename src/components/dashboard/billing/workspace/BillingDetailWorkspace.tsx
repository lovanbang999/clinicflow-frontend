'use client';

import {
  StethoscopeIcon,
  TestTubeIcon,
  PillIcon,
  ReceiptIcon,
  WarningCircleIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBilling } from '@/lib/hooks/billing/useBilling';
import { Invoice, InvoiceType, InvoiceStatus, PaymentMethod, AddInvoiceItemDto } from '@/lib/api/billing/billing';
import { bookingsApi } from '@/lib/api/appointment/bookings';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import { Booking, BookingStatus } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentModal } from '@/components/dashboard/billing/PaymentModal';
import { InvoiceCard } from '@/components/dashboard/billing/InvoiceCard';
import { useTranslations, useLocale } from 'next-intl';
import { QuickAddInvoiceModal } from '@/components/dashboard/billing/QuickAddInvoiceModal';
import { PrintableInvoice } from '@/components/dashboard/billing/PrintableInvoice';
import { PrintableTicket, TicketData, TicketItem } from '@/components/shared/PrintableTicket';

interface BillingDetailWorkspaceProps {
  bookingId: string;
  onRefreshQueue: () => void;
}

export function BillingDetailWorkspace({ bookingId, onRefreshQueue }: BillingDetailWorkspaceProps) {
  const router = useRouter();
  const t = useTranslations('receptionistBilling');
  const locale = useLocale();

  const {
    bookingInvoices,
    fetchInvoicesByBooking,
    createInvoice,
    addPayment,
    pendingLabOrders,
    fetchPendingLabOrders,
    deleteInvoice,
  } = useBilling();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<InvoiceType>(InvoiceType.CONSULTATION);
  const [creatingType, setCreatingType] = useState<InvoiceType | null>(null);

  // Printing states
  const [printingContent, setPrintingContent] = useState<'invoice' | 'ticket' | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);
  const [printingTicketData, setPrintingTicketData] = useState<TicketData | null>(null);

  useEffect(() => {
    if (bookingId) {
      setLoadingBooking(true);
      void fetchInvoicesByBooking(bookingId);
      void fetchPendingLabOrders(bookingId);

      bookingsApi.getById(bookingId)
        .then(setBooking)
        .catch(err => console.error("Failed to fetch booking", err))
        .finally(() => setLoadingBooking(false));
    }
  }, [bookingId, fetchInvoicesByBooking, fetchPendingLabOrders]);

  const handlePay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (
    amount: number,
    method: PaymentMethod,
    labOrderId?: string,
    insuranceCovered?: number,
    insuranceNumber?: string,
  ) => {
    if (!selectedInvoice) return;
    await addPayment(selectedInvoice.id, {
      amountPaid: amount,
      paymentMethod: method,
      labOrderId,
      insuranceCovered,
      insuranceNumber,
    });

    // Auto check-in if consultation
    if (selectedInvoice.invoiceType === InvoiceType.CONSULTATION && !selectedInvoice.booking?.queueRecord) {
      try {
        await bookingsApi.checkIn(bookingId);
      } catch (e) {
        console.error("Auto check-in failed", e);
      }
    }

    // B8 logic
    if (selectedInvoice.invoiceType === InvoiceType.PHARMACY) {
      try {
        await medicalRecordsApi.fulfillPrescription(bookingId, selectedInvoice.id);
      } catch (e) {
        console.error("Fulfill prescription failed", e);
      }
    }

    setPaymentModalOpen(false);
    setSelectedInvoice(null);
    void fetchInvoicesByBooking(bookingId);
    void fetchPendingLabOrders(bookingId);
    onRefreshQueue();
  };

  const handleCreateInvoice = (type: InvoiceType) => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  const handleQuickAddSubmit = async (labOrderIds: string[], items: AddInvoiceItemDto[]) => {
    try {
      setCreatingType(quickAddType);
      await createInvoice({
        bookingId,
        invoiceType: quickAddType,
        labOrderIds,
        items
      });
      setIsQuickAddOpen(false);
      void fetchInvoicesByBooking(bookingId);
      void fetchPendingLabOrders(bookingId);
      onRefreshQueue();
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingType(null);
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setPrintingInvoice(invoice);
    setPrintingContent('invoice');
    setTimeout(() => {
      window.print();
      setPrintingContent(null);
    }, 100);
  };

  const handlePrintTicket = async (invoice: Invoice) => {
    let targetInvoice = invoice;

    if (!invoice.booking?.queueRecord) {
      try {
        const checkInRes = await bookingsApi.checkIn(bookingId);
        targetInvoice = {
          ...invoice,
          booking: {
            ...invoice.booking!,
            queueRecord: checkInRes.queue,
          }
        };
        void fetchInvoicesByBooking(bookingId);
      } catch (e) {
        console.error("Failed to check in or get queue", e);
      }
    }

    const booking = targetInvoice.booking;
    const ticketItems: TicketItem[] = targetInvoice.items.map((item) => ({
      serviceName: item.itemName,
      roomName: item.labOrder
        ? (item.labOrder.service?.category?.code === 'CAT_XETNGHIEM' ? 'PHÒNG 02' : 
           item.labOrder.service?.category?.code === 'CAT_CDHA' ? 'PHÒNG 03' : 
           item.labOrder.service?.category?.name?.toUpperCase() || 'PHÒNG KỸ THUẬT')
        : (booking?.room?.name?.toUpperCase().includes('PHÒNG KHÁM') ? 'PHÒNG 01' : 
           booking?.room?.name?.toUpperCase() || 'PHÒNG 01'),
      doctorName: item.visitServiceOrder?.performer?.fullName || 
                 (item.labOrder ? '' : booking?.doctor?.fullName), // Blank for Lab if unknown, booking doctor only for consultation
      queueNumber: item.labOrder?.queueNumber || item.visitServiceOrder?.queueNumber || targetInvoice.booking?.queueRecord?.queuePosition || 'N/A',
      suggestedOrder: item.labOrder?.suggestedOrder || item.visitServiceOrder?.suggestedOrder,
      preparationNotes: item.labOrder?.service?.preparationNotes || item.visitServiceOrder?.service?.preparationNotes,
      type: item.labOrder ? 'LAB' : 'CONSULTATION',
    }));

    const data: TicketData = {
      patientName: booking?.patientProfile?.fullName || 'N/A',
      patientCode: booking?.patientProfile?.patientCode || 'N/A',
      doctorName: booking?.doctor?.fullName,
      items: ticketItems,
      date: new Date(),
    };

    setPrintingTicketData(data);
    setPrintingContent('ticket');
    setTimeout(() => {
      window.print();
      setPrintingContent(null);
      setPrintingTicketData(null);
    }, 100);
  };

  const consultationInvoices = bookingInvoices.filter(i => i.invoiceType === InvoiceType.CONSULTATION);
  const labInvoices = bookingInvoices.filter(i => i.invoiceType === InvoiceType.LAB);
  const pharmacyInvoices = bookingInvoices.filter(i => i.invoiceType === InvoiceType.PHARMACY);

  if (loadingBooking && !booking) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Detail Header */}
      <div className="px-8 py-6 border-b border-slate-100 bg-white sticky top-0 z-20">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <ReceiptIcon size={32} weight="duotone" className="text-[#1392ec]" />
              {booking?.patientProfile?.fullName}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
              <span>{t('detail.patientLabels.code')} <span className="text-slate-700 font-mono tracking-tight">{booking?.patientProfile?.patientCode}</span></span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span>{t('detail.patientLabels.doctor')} <span className="text-slate-700 font-bold">{booking?.doctor?.fullName}</span></span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">{t('detail.patientLabels.bookingCode')}</span>
            <span className="text-lg font-mono font-bold text-slate-800 tracking-wider bg-slate-100 px-3 py-1 rounded-xl">
              {booking?.bookingCode}
            </span>
          </div>
        </div>

        {/* Workflow Track */}
        {/* <BillingStepTrack currentStep={currentStepCode} /> */}
      </div>

      <div className="flex-1 overflow-auto p-8 pt-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main List */}
          <div className="xl:col-span-8 space-y-8">
            {/* Consultation */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <StethoscopeIcon size={18} weight="bold" className="text-[#1392ec]" /> {t('detail.sections.consultation')}
                </h3>
              </div>
              {consultationInvoices.length > 0 ? (
                consultationInvoices.map(inv => (
                  <InvoiceCard key={inv.id} invoice={inv} onPay={handlePay} onView={(inv) => router.push(`/receptionist/billing/${inv.id}`)} onPrintInvoice={handlePrintInvoice} onPrintTicket={handlePrintTicket} onDelete={() => deleteInvoice(inv.id, bookingId)} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-slate-500 mb-3">{t('detail.sections.emptyConsultation')}</p>
                  <Button size="sm" onClick={() => handleCreateInvoice(InvoiceType.CONSULTATION)} className="bg-[#1392ec] hover:bg-[#1392ec]/90 text-white rounded-xl">
                    <PlusIcon size={14} className="mr-2" /> {t('bookingInvoices.createNewInvoice')}
                  </Button>
                </div>
              )}
            </section>

            {/* Lab / Services */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TestTubeIcon size={18} weight="bold" className="text-amber-500" /> {t('detail.sections.lab')}
                </h3>
              </div>

              {pendingLabOrders.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4 mb-4">
                  <WarningCircleIcon size={24} weight="fill" className="text-amber-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-amber-800">
                      {t('detail.alerts.pendingLabs', { count: pendingLabOrders.length })}
                    </p>
                    <ul className="mt-2 space-y-1 mb-4">
                      {pendingLabOrders.map((order) => (
                        <li key={order.id} className="text-xs text-amber-700 bg-white/50 w-fit px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          {order.testName}
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" onClick={() => handleCreateInvoice(InvoiceType.LAB)} className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-sm rounded-xl py-4 h-9">
                      <PlusIcon size={16} className="mr-2" /> {t('detail.alerts.collectLabFees')}
                    </Button>
                  </div>
                </div>
              )}

              {labInvoices.length > 0 ? (
                labInvoices.map(inv => (
                  <InvoiceCard key={inv.id} invoice={inv} onPay={handlePay} onView={(inv) => router.push(`/receptionist/billing/${inv.id}`)} onPrintInvoice={handlePrintInvoice} onPrintTicket={handlePrintTicket} onDelete={() => deleteInvoice(inv.id, bookingId)} />
                ))
              ) : pendingLabOrders.length === 0 && (
                <div className="rounded-2xl border border-dotted border-slate-200 p-6 text-center">
                  <span className="text-slate-400 text-sm font-medium">{t('detail.sections.emptyLab')}</span>
                </div>
              )}
            </section>

            {/* Pharmacy */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <PillIcon size={18} weight="bold" className="text-emerald-500" /> {t('detail.sections.pharmacy')}
                </h3>
              </div>
              {pharmacyInvoices.length > 0 ? (
                pharmacyInvoices.map(inv => (
                  <InvoiceCard key={inv.id} invoice={inv} onPay={handlePay} onView={(inv) => router.push(`/receptionist/billing/${inv.id}`)} onPrintInvoice={handlePrintInvoice} onPrintTicket={handlePrintTicket} onDelete={() => deleteInvoice(inv.id, bookingId)} />
                ))
              ) : booking?.status === BookingStatus.COMPLETED ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-bold text-emerald-800 mb-2">{t('detail.sections.doctorCompleted')}</p>
                  <p className="text-xs text-emerald-600 mb-4 max-w-sm">{t('detail.sections.pharmacyHint')}</p>
                  <Button size="sm" onClick={() => handleCreateInvoice(InvoiceType.PHARMACY)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                    <PlusIcon size={14} className="mr-2" /> {t('bookingInvoices.createNewInvoice')}
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-dotted border-slate-200 p-6 text-center">
                  <span className="text-slate-400 text-sm font-medium">{t('detail.sections.emptyPharmacy')}</span>
                </div>
              )}
            </section>
          </div>

          {/* Right Summary Sidebar */}
          <div className="xl:col-span-4 h-fit sticky top-4">
            <Card className="rounded-2xl border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 bg-slate-900 text-white">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mb-2">{t('detail.summary.title')}</p>
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold tracking-tight">
                    {Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(bookingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0))}
                  </span>
                  <span className="text-sm font-semibold text-slate-400 uppercase">{t('kpis.unitCurrency')}</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{t('detail.summary.totalValue')}</span>
                  <span className="text-slate-800 font-bold">{Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(bookingInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0))} {locale === 'vi' ? 'đ' : ''}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{t('detail.summary.paidAmount')}</span>
                  <span className="text-emerald-600 font-bold">
                    {Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(bookingInvoices.filter(i => i.status === InvoiceStatus.PAID).reduce((sum, inv) => sum + Number(inv.totalAmount), 0))} {locale === 'vi' ? 'đ' : ''}
                  </span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-bold">{t('detail.summary.debtAmount')}</span>
                  <span className="text-xl font-black text-amber-500 tracking-tight">
                    {Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: locale === 'vi' ? 'VND' : 'USD', maximumFractionDigits: 0 }).format(bookingInvoices.reduce((sum, inv) => inv.status !== InvoiceStatus.PAID ? sum + Number(inv.totalAmount) : sum, 0))}
                  </span>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed italic">
                  {t('detail.summary.billingNote')}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedInvoice && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onPaymentSubmitted={handlePaymentSubmit}
        />
      )}

      <QuickAddInvoiceModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        invoiceType={quickAddType}
        pendingLabOrders={pendingLabOrders}
        onSubmit={handleQuickAddSubmit}
        isSubmitting={creatingType !== null}
      />

      {/* Hidden print area */}
      {printingContent === 'invoice' && printingInvoice && (
        <PrintableInvoice invoice={printingInvoice} />
      )}
      {printingContent === 'ticket' && printingTicketData && (
        <PrintableTicket ticket={printingTicketData} />
      )}
    </div>
  );
}
