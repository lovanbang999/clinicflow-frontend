'use client';

import { useState, useEffect, useCallback } from 'react';
import { billingApi, ListInvoicesParams, Invoice, PaginationData } from '@/lib/api/billing/billing';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export const useAdminInvoices = (initialParams: ListInvoicesParams = { page: 1, limit: 10 }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [params, setParams] = useState<ListInvoicesParams>(initialParams);
  
  const { execute, isLoading: loading } = useApiHandler();

  const fetchInvoices = useCallback(async () => {
    const result = await execute(
      () => billingApi.listInvoices(params),
      { errorFallbackMsg: 'fetchInvoicesListError' }
    );
    if (result) {
      setInvoices(result.invoices || []);
      setPagination(result.pagination || {});
    }
  }, [params, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const updateFilters = (newFilters: Partial<ListInvoicesParams>) => {
    setParams((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const goToPage = (page: number) => {
    setParams((prev) => ({ ...prev, page }));
  };

  return {
    invoices,
    pagination,
    loading,
    params,
    updateFilters,
    goToPage,
    refetch: fetchInvoices,
  };
};
