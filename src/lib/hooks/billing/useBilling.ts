'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';
import { InvoiceType, Invoice, PaginationData, LabOrderForBilling, ListInvoicesParams, billingApi, CreateInvoiceDto, AddPaymentDto, AddInvoiceItemDto, WorkspaceQueueItem, WorkspaceKpis } from '@/lib/api/billing/billing';

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
  const t = useTranslations('receptionistBilling.messages');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [bookingInvoices, setBookingInvoices] = useState<Invoice[]>([]);
  const [pendingLabOrders, setPendingLabOrders] = useState<LabOrderForBilling[]>([]);
  const [workspaceQueue, setWorkspaceQueue] = useState<WorkspaceQueueItem[]>([]);
  const [workspaceKpis, setWorkspaceKpis] = useState<WorkspaceKpis | null>(null);

  const { execute: executeInvoices, isLoading: loading } = useApiHandler();
  const { execute: executeCurrentInvoice, isLoading: loadingInvoice } = useApiHandler();
  const { execute: executeBookingInvoices, isLoading: loadingBookingInvoices } = useApiHandler();
  const { execute: executePendingLabs, isLoading: loadingPendingLabs } = useApiHandler();
  const { execute: executePayment, isLoading: processingPayment } = useApiHandler();
  const { execute: executeQueue, isLoading: loadingQueue } = useApiHandler();
  const { execute: executeKpis, isLoading: loadingKpis } = useApiHandler();

  const fetchInvoices = useCallback(async (params?: ListInvoicesParams) => {
    await executeInvoices(
      async () => {
        const result = await billingApi.listInvoices(params);
        setInvoices(result.invoices || []);
        setPagination(result.pagination || {});
      },
      { errorFallbackMsg: 'fetchListError' }
    );
  }, [executeInvoices]);

  const fetchInvoiceById = useCallback(async (id: string) => {
    return executeCurrentInvoice(
      async () => {
        const invoice = await billingApi.getInvoiceById(id);
        setCurrentInvoice(invoice);
        return invoice;
      },
      { errorFallbackMsg: 'fetchDetailError' }
    ).then(res => res || null);
  }, [executeCurrentInvoice]);

  const fetchInvoicesByBooking = useCallback(async (bookingId: string) => {
    return executeBookingInvoices(
      async () => {
        const result = await billingApi.listInvoicesByBooking(bookingId);
        setBookingInvoices(result);
        return result;
      },
      { errorFallbackMsg: 'fetchListError' }
    ).then(res => res || []);
  }, [executeBookingInvoices]);

  const fetchPendingLabOrders = useCallback(async (bookingId: string) => {
    return executePendingLabs(
      async () => {
        const result = await billingApi.getPendingLabOrdersForBilling(bookingId);
        setPendingLabOrders(result);
        return result;
      },
      { onError: () => setPendingLabOrders([]) } // silent fail like before
    ).then(res => res || []);
  }, [executePendingLabs]);

  const createInvoice = useCallback(async (dto: CreateInvoiceDto) => {
    return executePayment(
      async () => {
        const invoice = await billingApi.createInvoice(dto);
        setBookingInvoices((prev) => [...prev, invoice]);
        return invoice;
      },
      { onSuccessMsg: 'createInvoiceSuccess' }
    );
  }, [executePayment]);

  const deleteInvoice = useCallback(async (id: string, bookingId: string) => {
    const res = await executePayment(
      async () => {
        await billingApi.deleteInvoice(id);
        setBookingInvoices((prev) => prev.filter((inv) => inv.id !== id));
        await fetchPendingLabOrders(bookingId);
        return true;
      },
      { onSuccessMsg: 'cancelDraftInvoiceSuccess' }
    );
    return res === true;
  }, [executePayment, fetchPendingLabOrders]);

  const addPayment = useCallback(async (id: string, data: AddPaymentDto) => {
    return executePayment(
      async () => {
        const updatedInvoice = await billingApi.addPayment(id, data);
        setCurrentInvoice(updatedInvoice);
        setBookingInvoices((prev) =>
          prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)),
        );
        return updatedInvoice;
      },
      {
        onSuccess: (updatedInvoice) => {
          if (updatedInvoice.status === 'PAID') {
            toast.success('Đã thanh toán & hoàn tất hoá đơn');
          } else {
            toast.success(t('paymentSuccess'));
          }
        }
      }
    );
  }, [executePayment, t]);

  const fetchWorkspaceQueue = useCallback(async (params?: { search?: string }) => {
    return executeQueue(
      async () => {
        const result = await billingApi.getWorkspaceQueue(params);
        setWorkspaceQueue(result);
        return result;
      },
      { errorFallbackMsg: 'fetchQueueError' }
    ).then(res => res || []);
  }, [executeQueue]);

  const fetchWorkspaceKpis = useCallback(async () => {
    return executeKpis(
      async () => {
        const result = await billingApi.getWorkspaceKpis();
        setWorkspaceKpis(result);
        return result;
      },
      { errorFallbackMsg: 'fetchKpisError' }
    ).then(res => res || null);
  }, [executeKpis]);

  const finalizeInvoice = useCallback(async (id: string) => {
    return executePayment(
      async () => {
        const updatedInvoice = await billingApi.finalizeInvoice(id);
        setCurrentInvoice(updatedInvoice);
        setBookingInvoices((prev) =>
          prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)),
        );
        return updatedInvoice;
      },
      { onSuccessMsg: t('finalizeSuccess') }
    );
  }, [executePayment, t]);

  const addItemToInvoice = useCallback(async (invoiceId: string, data: AddInvoiceItemDto) => {
    return executePayment(
      async () => {
        const updatedInvoice = await billingApi.addItemToInvoice(invoiceId, data);
        setCurrentInvoice(updatedInvoice);
        setBookingInvoices((prev) =>
          prev.map((inv) => (inv.id === updatedInvoice.id ? updatedInvoice : inv)),
        );
        return updatedInvoice;
      },
      { onSuccessMsg: 'addServiceSuccess' }
    );
  }, [executePayment]);

  const removeItemFromInvoice = useCallback(async (invoiceId: string, itemId: string, onRefresh?: () => void) => {
    await executePayment(
      async () => {
        await billingApi.removeItemFromInvoice(invoiceId, itemId);
        onRefresh?.();
      },
      { onSuccessMsg: 'removeServiceSuccess' }
    );
  }, [executePayment]);

  return {
    invoices,
    loading,
    pagination,
    fetchInvoices,
    
    currentInvoice,
    loadingInvoice,
    fetchInvoiceById,

    bookingInvoices,
    loadingBookingInvoices,
    fetchInvoicesByBooking,

    pendingLabOrders,
    loadingPendingLabs,
    fetchPendingLabOrders,

    processingPayment,
    createInvoice,
    deleteInvoice,
    addPayment,
    finalizeInvoice,
    addItemToInvoice,
    removeItemFromInvoice,

    workspaceQueue,
    loadingQueue,
    fetchWorkspaceQueue,

    workspaceKpis,
    loadingKpis,
    fetchWorkspaceKpis,
  };
};
