'use client';

import { useState, useCallback } from 'react';
import { billingApi, Invoice, ListInvoicesParams, AddPaymentDto } from '../api/billing';
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

export const useBilling = () => {
  const t = useTranslations('dashboard.receptionist.billingManagement.messages');
  const tErrors = useTranslations('errors');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Record<string, unknown>>({});
  
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleError = useCallback((err: unknown, defaultMessageKey: string) => {
    const error = err as ApiError;
    const errorKey = getErrorKey(error.messageCode, 'generic');
    
    // Check if there is a specific translation for the error code
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

  const addPayment = useCallback(async (id: string, data: AddPaymentDto) => {
    try {
      setProcessingPayment(true);
      const updatedInvoice = await billingApi.addPayment(id, data);
      setCurrentInvoice(updatedInvoice);
      toast.success(t('paymentSuccess'));
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
    invoices,
    loading,
    pagination,
    fetchInvoices,
    
    currentInvoice,
    loadingInvoice,
    processingPayment,
    fetchInvoiceById,
    addPayment,
    finalizeInvoice,
  };
};
