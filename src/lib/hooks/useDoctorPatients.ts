import { useState, useEffect, useCallback, useRef } from 'react';
import { bookingsApi } from '../api/bookings';
import { DoctorPatientSummary } from '@/types';
import { useTranslations } from 'next-intl';
import { useApiHandler } from './useApiHandler';

export function useDoctorPatients() {
  const [patients, setPatients] = useState<DoctorPatientSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  const t = useTranslations('common');
  const limit = 10;
  
  // Use a ref to store the latest search query to prevent race conditions
  const queryRef = useRef(searchQuery);

  const { execute, isLoading: loading } = useApiHandler();

  const fetchPatients = useCallback(async (currentPage: number, search: string) => {
    execute(
      async () => {
        const data = await bookingsApi.getDoctorPatients({
          page: currentPage,
          limit,
          search: search || undefined,
        });
        
        // If the search query has changed since we made the request, discard the results
        if (queryRef.current !== search) return;

        setPatients(data.patients);
        // Fallbacks in case pagination metadata is partial
        const pagination = data.pagination as { total?: number; totalPages?: number };
        setTotal(pagination?.total || 0);
        setTotalPages(pagination?.totalPages || 1);
      },
      {
        errorFallbackMsg: t('error'),
      }
    ).catch(() => {
      // Ignored empty catch, toasts are automatically handled by execute()
    });
  }, [t, execute]);

  // Debounced search
  useEffect(() => {
    queryRef.current = searchQuery;
    const timeoutId = setTimeout(() => {
      setPage(1); // Reset page on new search
      fetchPatients(1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchPatients]);

  // Fetch on page change
  useEffect(() => {
    // Prevent double fetch if search query just changed (handled by the effect above)
    if (page === 1 && searchQuery !== queryRef.current) return;
    
    fetchPatients(page, queryRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, fetchPatients]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return {
    patients,
    loading,
    total,
    page,
    totalPages,
    searchQuery,
    setPage,
    handleSearch,
    clearSearch,
    refetch: () => fetchPatients(page, searchQuery),
  };
}
