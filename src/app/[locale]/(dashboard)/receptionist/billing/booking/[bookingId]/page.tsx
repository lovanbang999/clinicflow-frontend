'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBilling } from '@/lib/hooks/useBilling';
import { Invoice, InvoiceType, InvoiceStatus, PaymentMethod } from '@/lib/api/billing';
import { bookingsApi } from '@/lib/api/bookings';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CaretLeftIcon,
  PlusIcon,
  StethoscopeIcon,
  TestTubeIcon,
  PillIcon,
  ReceiptIcon,
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentModal } from '@/components/dashboard/billing/PaymentModal';
import { PrintableInvoice } from '@/components/dashboard/billing/PrintableInvoice';
import { PrintableQueueTicket } from '@/components/dashboard/billing/PrintableQueueTicket';

import { useTranslations } from 'next-intl';
import { InvoiceCard } from '@/components/dashboard/billing/InvoiceCard';

function formatVND(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

// Main Page

export default function BookingInvoicesPage() {
  const t = useTranslations('dashboard.receptionist.billingManagement.bookingInvoices');
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const {
    bookingInvoices,
    loadingBookingInvoices,
    fetchInvoicesByBooking,
    createInvoice,
    addPayment,
    processingPayment,
    pendingLabOrders,
    fetchPendingLabOrders,
  } = useBilling();

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creatingType, setCreatingType] = useState<InvoiceType | null>(null);
  
  // Printing states
  const [printingContent, setPrintingContent] = useState<'invoice' | 'ticket' | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (bookingId) {
      void fetchInvoicesByBooking(bookingId);
      void fetchPendingLabOrders(bookingId);
    }
  }, [bookingId, fetchInvoicesByBooking, fetchPendingLabOrders]);

  const handlePay = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (amount: number, method: PaymentMethod, labOrderId?: string) => {
    if (!selectedInvoice) return;
    await addPayment(selectedInvoice.id, {
      amountPaid: amount,
      paymentMethod: method,
      labOrderId,
    });
    
    // Auto check-in if consultation
    if (selectedInvoice.invoiceType === InvoiceType.CONSULTATION && !selectedInvoice.booking?.queueRecord) {
      try {
        await bookingsApi.checkIn(bookingId);
      } catch (e) {
        console.error("Auto check-in failed", e);
      }
    }
    
    setPaymentModalOpen(false);
    setSelectedInvoice(null);
    // Refresh both invoices and pending labs (lab orders may now be PAID)
    void fetchInvoicesByBooking(bookingId);
    void fetchPendingLabOrders(bookingId);
  };

  const handleCreateInvoice = async (type: InvoiceType) => {
    setCreatingType(type);
    try {
      await createInvoice({ bookingId, invoiceType: type });
      // Refresh pending labs after creating LAB invoice
      void fetchPendingLabOrders(bookingId);
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
        // Refresh behind the scenes
        void fetchInvoicesByBooking(bookingId);
      } catch (e) {
        console.error("Failed to check in or get queue", e);
      }
    }

    setPrintingInvoice(targetInvoice);
    setPrintingContent('ticket');
    setTimeout(() => {
      window.print();
      setPrintingContent(null);
    }, 100);
  };

  const INVOICE_TYPES = [
    { type: InvoiceType.CONSULTATION, label: t('types.CONSULTATION'), icon: <StethoscopeIcon size={16} weight="bold" />, btnColor: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { type: InvoiceType.LAB, label: t('types.LAB'), icon: <TestTubeIcon size={16} weight="bold" />, btnColor: 'bg-violet-600 hover:bg-violet-700 text-white' },
    { type: InvoiceType.PHARMACY, label: t('types.PHARMACY'), icon: <PillIcon size={16} weight="bold" />, btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  ];

  // Summary stats
  const totalInvoices = bookingInvoices.length;
  const paidCount = bookingInvoices.filter((i) => i.status === InvoiceStatus.PAID).length;
  const pendingCount = totalInvoices - paidCount;
  const grandTotal = bookingInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const existingTypes = new Set(bookingInvoices.map((i) => i.invoiceType));

  const hasPendingLabs = pendingLabOrders.length > 0;

  return (
    <div className="mx-auto p-4 sm:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <CaretLeftIcon size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-800">
            <ReceiptIcon size={24} weight="duotone" className="text-[#1392ec]" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('bookingCode')}{' '}
            <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{bookingId}</code>
          </p>
        </div>
      </div>

      {/* Pending Lab Orders Alert Banner */}
      {hasPendingLabs && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <WarningCircleIcon size={22} weight="fill" className="text-amber-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">
              {t('pendingLabAlert', { count: pendingLabOrders.length })}
            </p>
            <ul className="mt-1 space-y-0.5">
              {pendingLabOrders.map((order) => (
                <li key={order.id} className="text-xs text-amber-700 flex items-center gap-1.5">
                  <TestTubeIcon size={12} weight="bold" />
                  {order.testName}
                </li>
              ))}
            </ul>
          </div>
          <Button
            size="sm"
            disabled={processingPayment || creatingType !== null}
            onClick={() => handleCreateInvoice(InvoiceType.LAB)}
            className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shrink-0 h-9 text-xs gap-1.5"
          >
            {creatingType === InvoiceType.LAB ? (
              <span className="animate-spin cursor-wait">⏳</span>
            ) : (
              <TestTubeIcon size={14} weight="bold" />
            )}
            {t('createLabInvoice')}
          </Button>
        </div>
      )}

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 rounded-xl border border-slate-200 shadow-none text-center">
          <p className="text-2xl font-bold text-slate-800">{totalInvoices}</p>
          <p className="text-xs text-slate-500 mt-0.5">{t('totalInvoices')}</p>
        </Card>
        <Card className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-none text-center">
          <p className="text-2xl font-bold text-emerald-600">{paidCount}</p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <CheckCircleIcon size={12} weight="fill" className="text-emerald-500" />
            {t('paidInvoices')}
          </p>
        </Card>
        <Card className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-none text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-center gap-1">
            <ClockIcon size={12} weight="fill" className="text-amber-500" />
            {t('unpaidInvoices')}
          </p>
        </Card>
      </div>

      {/* Create New Invoice */}
      <Card className="p-5 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <PlusIcon size={16} weight="bold" className="text-[#1392ec]" />
          {t('createNewInvoice')}
        </p>
        <div className="flex flex-wrap gap-2">
          {INVOICE_TYPES.map((cfg) => {
            const alreadyHas = existingTypes.has(cfg.type);
            const isLabAndHasPending = cfg.type === InvoiceType.LAB && hasPendingLabs;
            return (
              <Button
                key={cfg.type}
                size="sm"
                variant={alreadyHas && !isLabAndHasPending ? 'outline' : 'default'}
                disabled={processingPayment || creatingType !== null}
                onClick={() => handleCreateInvoice(cfg.type)}
                className={`cursor-pointer h-9 gap-2 text-sm ${!alreadyHas || isLabAndHasPending ? cfg.btnColor : ''}`}
              >
                {creatingType === cfg.type ? (
                  <span className="animate-spin cursor-wait">⏳</span>
                ) : (
                  cfg.icon
                )}
                {cfg.label}
                {alreadyHas && !isLabAndHasPending && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1">+1</Badge>
                )}
                {isLabAndHasPending && (
                  <Badge className="text-[10px] h-4 px-1 bg-amber-200 text-amber-800">
                    {pendingLabOrders.length} XN
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {t('labInvoiceHint')}
        </p>
      </Card>

      {/* Invoices List */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
          {t('invoiceList', { count: totalInvoices })}
        </h2>

        {loadingBookingInvoices ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border-2 border-slate-100 p-5 space-y-3">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : bookingInvoices.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-10 text-center">
            <ReceiptIcon size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">{t('emptyInvoiceList')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookingInvoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                onPay={handlePay}
                onView={(inv) => router.push(`/receptionist/billing/${inv.id}`)}
                onPrintInvoice={handlePrintInvoice}
                onPrintTicket={handlePrintTicket}
              />
            ))}
          </div>
        )}
      </div>

      {/* Grand Total */}
      {bookingInvoices.length > 0 && (
        <Card className="p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center">
            <p className="text-slate-600 font-medium">{t('totalBookingAmount')}</p>
            <p className="text-xl font-bold text-[#1392ec]">{formatVND(grandTotal)}</p>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-slate-400">
              {t('paidInvoiceCount', { paid: paidCount, total: totalInvoices })}
            </p>
            <p className="text-sm text-emerald-600 font-medium">
              {t('paid')}:{' '}
              {formatVND(
                bookingInvoices
                  .filter((i) => i.status === InvoiceStatus.PAID)
                  .reduce((s, i) => s + Number(i.totalAmount), 0),
              )}
            </p>
          </div>
        </Card>
      )}

      {/* Payment Modal */}
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

      {/* Hidden print area */}
      {printingContent === 'invoice' && printingInvoice && (
        <PrintableInvoice invoice={printingInvoice} />
      )}
      {printingContent === 'ticket' && printingInvoice && (
        <PrintableQueueTicket invoice={printingInvoice} />
      )}
    </div>
  );
}
