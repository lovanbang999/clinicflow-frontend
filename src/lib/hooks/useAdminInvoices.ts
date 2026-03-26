'use client';

import { useState, useEffect, useCallback } from 'react';
import { billingApi, ListInvoicesParams, Invoice, PaginationData } from '@/lib/api/billing';
import { toast } from 'sonner';

export const useAdminInvoices = (initialParams: ListInvoicesParams = { page: 1, limit: 10 }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<ListInvoicesParams>(initialParams);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const result = await billingApi.listInvoices(params);
      console.log('result: ', result);
      setInvoices(result.invoices || []);
      setPagination(result.pagination || {});
    } catch (err) {
      console.error('[useAdminInvoices]', err);
      toast.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchInvoices();
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
