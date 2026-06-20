'use client';

import { useState, useCallback } from 'react';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';
import { billingApi, type Invoice, type PaginationData, type ListInvoicesParams } from '@/lib/api/billing/billing';

export function useMyInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const { execute, isLoading, error } = useApiHandler();

  const fetchMyInvoices = useCallback(async (params?: ListInvoicesParams) => {
    return execute(
      async () => {
        const result = await billingApi.listMyInvoices(params);
        setInvoices(result.invoices || []);
        setPagination(result.pagination || {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        });
        return result;
      },
      {
        errorFallbackMsg: 'fetchListError',
      }
    );
  }, [execute]);

  return {
    invoices,
    pagination,
    isLoading,
    error,
    fetchMyInvoices,
  };
}
