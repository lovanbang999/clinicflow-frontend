'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBilling } from '@/lib/hooks/billing/useBilling';
import { Invoice, InvoiceType, InvoiceStatus, PaymentMethod } from '@/lib/api/billing/billing';
import { bookingsApi } from '@/lib/api/appointment/bookings';
import { medicalRecordsApi } from '@/lib/api/clinical/medical-records';
import { Booking, BookingStatus } from '@/types';
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
import { QuickAddInvoiceModal } from '@/components/dashboard/billing/QuickAddInvoiceModal';
import { AddInvoiceItemDto } from '@/lib/api/billing/billing';
import { useTranslations } from 'next-intl';
import { InvoiceCard } from '@/components/dashboard/billing/InvoiceCard';

function formatVND(val: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

// Main Page

export default function BookingInvoicesPage() {
  const t = useTranslations('receptionistBilling.bookingInvoices');
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
    deleteInvoice,
  } = useBilling();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creatingType, setCreatingType] = useState<InvoiceType | null>(null);
  
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<InvoiceType>(InvoiceType.CONSULTATION);
  
  // Printing states
  const [printingContent, setPrintingContent] = useState<'invoice' | 'ticket' | null>(null);
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (bookingId) {
      void fetchInvoicesByBooking(bookingId);
      void fetchPendingLabOrders(bookingId);
      
      // Fetch booking details for the header
      setLoadingBooking(true);
      bookingsApi.getById(bookingId)
        .then(setBooking)
        .catch(() => {})
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
        void e;
      }
    }

    // B8 — Tự động fulfill prescription khi PHARMACY invoice được thanh toán
    if (selectedInvoice.invoiceType === InvoiceType.PHARMACY) {
      try {
        await medicalRecordsApi.fulfillPrescription(bookingId, selectedInvoice.id);
      } catch (e) {
        void e;
      }
    }

    setPaymentModalOpen(false);
    setSelectedInvoice(null);
    // Refresh both invoices and pending labs (lab orders may now be PAID)
    void fetchInvoicesByBooking(bookingId);
    void fetchPendingLabOrders(bookingId);
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
    } catch (e) {
      void e;
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
        void e;
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
    { type: InvoiceType.SERVICE, label: t('types.SERVICE'), icon: <TestTubeIcon size={16} weight="bold" />, btnColor: 'bg-violet-600 hover:bg-violet-700 text-white' },
    { type: InvoiceType.PHARMACY, label: t('types.PHARMACY'), icon: <PillIcon size={16} weight="bold" />, btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  ];

  // Summary stats
  const totalInvoices = bookingInvoices.length;
  const paidCount = bookingInvoices.filter((i) => i.status === InvoiceStatus.PAID).length;
  const pendingCount = totalInvoices - paidCount;
  const grandTotal = bookingInvoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
  const paidTotal = bookingInvoices.filter((i) => i.status === InvoiceStatus.PAID).reduce((s, i) => s + Number(i.totalAmount), 0);
  const unpaidTotal = grandTotal - paidTotal;
  const existingTypes = new Set(bookingInvoices.map((i) => i.invoiceType));

  const hasPendingLabs = pendingLabOrders.length > 0;

  // Group invoices
  const consultationInvoices = bookingInvoices.filter(i => i.invoiceType === InvoiceType.CONSULTATION);
  const labInvoices = bookingInvoices.filter(i => i.invoiceType === InvoiceType.SERVICE);
  const pharmacyInvoices = bookingInvoices.filter(i => i.invoiceType === InvoiceType.PHARMACY);

  return (
    <div className="mx-auto py-4 px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <CaretLeftIcon size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-800">
            <ReceiptIcon size={28} weight="duotone" className="text-[#1392ec]" />
            {loadingBooking ? <Skeleton className="h-8 w-48" /> : (booking?.patientProfile?.fullName || t('patientVisitHub'))}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            {t('bookingCode')}: <span className="font-mono text-slate-700 tracking-wide">{loadingBooking ? '...' : (booking?.bookingCode || bookingId)}</span>
          </p>
        </div>
      </div>

      {/* AWAITING_RESULTS Banner — patient is at the lab */}
      {booking?.status === BookingStatus.AWAITING_RESULTS && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Bệnh nhân đang ở phòng xét nghiệm / thủ thuật</p>
            <p className="text-xs text-amber-600 mt-0.5">Đang chờ kết quả từ Kỹ thuật viên. Hóa đơn thuốc sẽ được tạo sau khi bác sĩ hoàn tất khám.</p>
          </div>
        </div>
      )}

      {loadingBookingInvoices ? (
        <div className="space-y-6 mt-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Service Details (62%) */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-[#1392ec] rounded-full"></span> {t('serviceDetailTitle')}
          </h2>

          {/* Consultation Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <StethoscopeIcon size={18} /> {t('consultationSection')}
            </h3>
            {consultationInvoices.length > 0 ? (
              consultationInvoices.map(inv => (
                <InvoiceCard key={inv.id} invoice={inv} onPay={handlePay} onView={(inv) => router.push(`/receptionist/billing/${inv.id}`)} onPrintInvoice={handlePrintInvoice} onPrintTicket={handlePrintTicket} onDelete={(inv) => deleteInvoice(inv.id, bookingId)} />
              ))
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                <span className="text-slate-500 text-sm">{t('emptyConsultation')}</span>
                <Button size="sm" onClick={() => handleCreateInvoice(InvoiceType.CONSULTATION)} disabled={processingPayment || creatingType !== null} className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer h-8 text-xs">
                  {creatingType === InvoiceType.CONSULTATION ? '⏳' : <PlusIcon size={14} className="mr-1" />} {t('createConsultationInvoice')}
                </Button>
              </div>
            )}
          </div>

          {/* Laboratory Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <TestTubeIcon size={18} /> {t('labSection')}
            </h3>
            
            {hasPendingLabs && (
              <div className="rounded-xl border-l-4 border-l-amber-400 border border-y-amber-200 border-r-amber-200 bg-amber-50/50 p-4">
                <div className="flex items-start gap-3">
                  <WarningCircleIcon size={20} weight="fill" className="text-amber-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-800 text-sm">
                      {t('pendingLabAlert', { count: pendingLabOrders.length })}
                    </p>
                    <ul className="mt-1.5 mb-3 space-y-1">
                      {pendingLabOrders.map((order) => (
                        <li key={order.id} className="text-xs text-amber-700 flex items-center gap-2 bg-amber-100/50 w-fit px-2 py-1 rounded-md">
                          <TestTubeIcon size={12} weight="bold" />
                          {order.testName}
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" onClick={() => handleCreateInvoice(InvoiceType.SERVICE)} disabled={processingPayment || creatingType !== null} className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer h-8 text-xs w-full sm:w-auto shadow-sm">
                      {creatingType === InvoiceType.SERVICE ? '⏳' : <TestTubeIcon size={14} weight="bold" className="mr-1.5" />} {t('createLabInvoice')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {labInvoices.length > 0 ? (
              labInvoices.map(inv => (
                <InvoiceCard key={inv.id} invoice={inv} onPay={handlePay} onView={(inv) => router.push(`/receptionist/billing/${inv.id}`)} onPrintInvoice={handlePrintInvoice} onPrintTicket={handlePrintTicket} onDelete={(inv) => deleteInvoice(inv.id, bookingId)} />
              ))
            ) : (!hasPendingLabs && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                <span className="text-slate-400 text-sm font-medium">{t('emptyLab')}</span>
              </div>
            ))}
          </div>

          {/* Pharmacy Section */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <PillIcon size={18} /> {t('pharmacySection')}
            </h3>
            {pharmacyInvoices.length > 0 ? (
              pharmacyInvoices.map(inv => (
                <InvoiceCard key={inv.id} invoice={inv} onPay={handlePay} onView={(inv) => router.push(`/receptionist/billing/${inv.id}`)} onPrintInvoice={handlePrintInvoice} onPrintTicket={handlePrintTicket} onDelete={(inv) => deleteInvoice(inv.id, bookingId)} />
              ))
            ) : booking?.status === BookingStatus.COMPLETED ? (
              // B8 (v5.0): Only show pharmacy create button after doctor marks COMPLETED
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="flex items-start gap-3">
                  <PillIcon size={20} weight="fill" className="text-emerald-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-800 text-sm">Bệnh nhân có muốn mua thuốc tại phòng khám?</p>
                    <p className="text-xs text-emerald-600 mt-1 mb-3">Bác sĩ đã kê đơn. Nếu bệnh nhân muốn mua thuốc tại đây, tạo hóa đơn thuốc để thu tiền.</p>
                    <Button
                      size="sm"
                      onClick={() => handleCreateInvoice(InvoiceType.PHARMACY)}
                      disabled={processingPayment || creatingType !== null}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer h-8 text-xs"
                    >
                      {creatingType === InvoiceType.PHARMACY ? '⏳' : <PlusIcon size={14} className="mr-1" />}
                      {t('createPharmacyInvoice')}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-center">
                <span className="text-slate-400 text-sm font-medium">Hóa đơn thuốc sẽ xuất hiện sau khi bác sĩ hoàn tất khám</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Summary Hub (38%) */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <Card className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-50/80 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <ReceiptIcon size={20} weight="fill" className="text-slate-400" /> {t('cartTitle')}
                </h3>
              </div>
              
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm">{t('grandTotal')} ({totalInvoices})</span>
                  <span className="font-semibold text-slate-800">{formatVND(grandTotal)}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 text-sm flex items-center gap-1.5">
                    <CheckCircleIcon size={16} weight="fill" className="text-emerald-500" /> {t('paidAmountLabel')} ({paidCount})
                  </span>
                  <span className="font-semibold text-emerald-600">{formatVND(paidTotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <ClockIcon size={16} weight="fill" className="text-amber-500" /> {t('debtAmountLabel')} ({pendingCount})
                  </span>
                  <span className="text-xl font-bold text-amber-600">{formatVND(unpaidTotal)}</span>
                </div>
              </div>

              {pendingCount > 0 && (
                <div className="p-5 pt-0">
                  <div className="rounded-xl bg-amber-50 p-3 mb-4">
                    <p className="text-xs text-amber-700 font-medium">{t('debtWarning', { count: pendingCount })}</p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <p className="text-sm font-semibold text-slate-700">{t('quickAddService')}</p>
              <div className="flex flex-col gap-2">
                {INVOICE_TYPES.map((cfg) => {
                  const alreadyHas = existingTypes.has(cfg.type);
                  return (
                    <Button
                      key={cfg.type}
                      variant={alreadyHas ? 'outline' : 'default'}
                      disabled={processingPayment || creatingType !== null}
                      onClick={() => handleCreateInvoice(cfg.type)}
                      className={`cursor-pointer justify-start h-10 gap-2 text-sm w-full ${!alreadyHas ? cfg.btnColor : 'text-slate-600'}`}
                    >
                      {creatingType === cfg.type ? <span className="animate-spin w-4 text-center">⏳</span> : cfg.icon}
                      {cfg.label}
                      {alreadyHas && <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">{t('alreadyCreated')}</Badge>}
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
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

      {/* Quick Add Modal */}
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
      {printingContent === 'ticket' && printingInvoice && (
        <PrintableQueueTicket invoice={printingInvoice} />
      )}
    </div>
  );
}
