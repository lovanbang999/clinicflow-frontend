'use client';

import { useState, useCallback } from 'react';
import {
  billingApi,
  Invoice,
  InvoiceType,
  LabOrderForBilling,
  ListInvoicesParams,
  AddPaymentDto,
  CreateInvoiceDto,
} from '../api/billing';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export interface ApiError extends Error {
  messageCode?: string;
}

export const getErrorKey = (messageCode?: string, defaultKey = 'generic') => {
  if (!messageCode) return defaultKey;
  
  const parts = messageCode.toLowerCase().split('.');
  if (parts.length >= 2) {
    if (parts.length > 2) {
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    }
    return `${parts[0]}.${parts[1]}`;
  }
  return defaultKey;
};

/** Returns a display label for an InvoiceType */
export const getInvoiceTypeLabel = (type: InvoiceType): string => {
  switch (type) {
    case InvoiceType.CONSULTATION: return 'Khám';
    case InvoiceType.LAB:          return 'Cận lâm sàng';
    case InvoiceType.PHARMACY:     return 'Thuốc';
    default:                       return type;
  }
};

export const useBilling = () => {
  const t = useTranslations('dashboard.receptionist.billingManagement.messages');
  const tErrors = useTranslations('errors');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Record<string, unknown>>({});
  
  // Single invoice detail
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Invoices list for a specific booking
  const [bookingInvoices, setBookingInvoices] = useState<Invoice[]>([]);
  const [loadingBookingInvoices, setLoadingBookingInvoices] = useState(false);

  // Pending unbilled lab orders for a booking (for alert banner)
  const [pendingLabOrders, setPendingLabOrders] = useState<LabOrderForBilling[]>([]);
  const [loadingPendingLabs, setLoadingPendingLabs] = useState(false);

  const [processingPayment, setProcessingPayment] = useState(false);

  const handleError = useCallback((err: unknown, defaultMessageKey: string) => {
    const error = err as ApiError;
    const errorKey = getErrorKey(error.messageCode, 'generic');
    
    let errorMessage = tErrors(errorKey);
    if (errorMessage === errorKey) {
      errorMessage = error.message || tErrors(defaultMessageKey) || t(defaultMessageKey);
    }

    toast.error(t('errorTitle'), {
      description: errorMessage,
    });
  }, [t, tErrors]);

  const fetchInvoices = useCallback(async (params?: ListInvoicesParams) => {
    try {
      setLoading(true);
      const result = await billingApi.listInvoices(params);
      setInvoices(result.invoices || []);
      setPagination(result.pagination || {});
    } catch (err) {
      handleError(err, 'loadListFailed');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchInvoiceById = useCallback(async (id: string) => {
    try {
      setLoadingInvoice(true);
      const invoice = await billingApi.getInvoiceById(id);
      setCurrentInvoice(invoice);
      return invoice;
    } catch (err) {
      handleError(err, 'loadDetailFailed');
      return null;
    } finally {
      setLoadingInvoice(false);
    }
  }, [handleError]);

  /**
   * Fetch all invoices for a booking (Phương án B: nhiều invoice/booking).
   */
  const fetchInvoicesByBooking = useCallback(async (bookingId: string) => {
    try {
      setLoadingBookingInvoices(true);
      const result = await billingApi.listInvoicesByBooking(bookingId);
      setBookingInvoices(result);
      return result;
    } catch (err) {
      handleError(err, 'loadListFailed');
      return [];
    } finally {
      setLoadingBookingInvoices(false);
    }
  }, [handleError]);

  /**
   * Fetch pending (unbilled) lab orders for a booking.
   * Used to show billing alert banner: "BN có XN chưa thu tiền".
   */
  const fetchPendingLabOrders = useCallback(async (bookingId: string) => {
    try {
      setLoadingPendingLabs(true);
      const result = await billingApi.getPendingLabOrdersForBilling(bookingId);
      setPendingLabOrders(result);
      return result;
    } catch {
      setPendingLabOrders([]);
      return [];
    } finally {
      setLoadingPendingLabs(false);
    }
  }, []);

  /**
   * Create a new invoice for a booking (chọn loại: Khám / XN / Thuốc).
   */
  const createInvoice = useCallback(async (dto: CreateInvoiceDto) => {
    try {
      setProcessingPayment(true);
      const invoice = await billingApi.createInvoice(dto);
      // Refresh booking invoices list
      setBookingInvoices((prev) => [...prev, invoice]);
      toast.success('Đã tạo hoá đơn mới');
      return invoice;
    } catch (err) {
      handleError(err, 'generic');
      throw err;
    } finally {
      setProcessingPayment(false);
    }
  }, [handleError]);

  const deleteInvoice = useCallback(async (id: string, bookingId: string) => {
    try {
      setProcessingPayment(true);
      await billingApi.deleteInvoice(id);
      
      // Remove from bookingInvoices list
      setBookingInvoices((prev) => prev.filter((inv) => inv.id !== id));
      
      // Refresh pending lab orders to show them again
      await fetchPendingLabOrders(bookingId);
      
      toast.success('Đã huỷ hoá đơn nháp thành công');
      return true;
    } catch (err) {
      handleError(err, 'generic');
      throw err;
    } finally {
      setProcessingPayment(false);
    }
  }, [handleError, fetchPendingLabOrders]);

  const addPayment = useCallback(async (id: string, data: AddPaymentDto) => {
    try {
      setProcessingPayment(true);
      const updatedInvoice = await billingApi.addPayment(id, data);
      setCurrentInvoice(updatedInvoice);

      // Update in bookingInvoices list too (if present)
      setBookingInvoices((prev) =>
        prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)),
      );

      if (updatedInvoice.status === 'PAID') {
        toast.success('Đã thanh toán & hoàn tất hoá đơn');
      } else {
        toast.success(t('paymentSuccess'));
      }
      return updatedInvoice;
    } catch (err) {
      handleError(err, 'paymentFailed');
      throw err;
    } finally {
      setProcessingPayment(false);
    }
  }, [handleError, t]);

  const finalizeInvoice = useCallback(async (id: string) => {
    try {
      setProcessingPayment(true);
      const updatedInvoice = await billingApi.finalizeInvoice(id);
      setCurrentInvoice(updatedInvoice);
      setBookingInvoices((prev) =>
        prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)),
      );
      toast.success(t('finalizeSuccess'));
      return updatedInvoice;
    } catch (err) {
      handleError(err, 'finalizeFailed');
      throw err;
    } finally {
      setProcessingPayment(false);
    }
  }, [handleError, t]);

  return {
    // Global invoice list
    invoices,
    loading,
    pagination,
    fetchInvoices,
    
    // Single invoice detail
    currentInvoice,
    loadingInvoice,
    fetchInvoiceById,

    // Booking-scoped invoice list    // Invoices by booking
    bookingInvoices,
    loadingBookingInvoices,
    fetchInvoicesByBooking,

    // Pending unbilled lab orders (for billing alert banner)
    pendingLabOrders,
    loadingPendingLabs,
    fetchPendingLabOrders,

    // Payment actions
    processingPayment,
    createInvoice,
    deleteInvoice,
    addPayment,
    finalizeInvoice,
  };
};
