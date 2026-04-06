import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { labOrdersApi, type LabOrder, type CreateLabOrderDto, type UploadLabResultDto } from '../api/lab-orders';
import { useApiHandler } from '@/lib/hooks/core/useApiHandler';

export function useLabOrders(bookingId: string) {
  const t = useTranslations('technicianWorklist.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const { execute: executeFetch, isLoading } = useApiHandler();
  const { execute: executeSubmit, isLoading: isSubmitting } = useApiHandler();

  const fetchOrders = useCallback(async () => {
    if (!bookingId) return;
    await executeFetch(
      async () => {
        const data = await labOrdersApi.getOrdersByBooking(bookingId);
        setOrders(data);
      },
      { errorFallbackMsg: t('fetchError') }
    );
  }, [bookingId, t, executeFetch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrders, t]);

  const addOrder = async (dto: Omit<CreateLabOrderDto, 'bookingId'>) => {
    const res = await executeSubmit(
      async () => {
        const newOrder = await labOrdersApi.createOrder({ ...dto, bookingId });
        setOrders((prev) => [newOrder, ...prev]);
        return true;
      },
      {
        onSuccessMsg: t('createSuccess'),
        errorFallbackMsg: t('createError'),
        onError: () => {}
      }
    );
    return res === true;
  };

  const removeOrder = async (id: string) => {
    await executeSubmit(
      async () => {
        await labOrdersApi.deleteOrder(id);
        setOrders((prev) => prev.filter((o) => o.id !== id));
      },
      {
        onSuccessMsg: t('cancelSuccess'),
        errorFallbackMsg: t('cancelError'),
        onError: () => {}
      }
    );
  };

  return {
    orders,
    isLoading,
    isSubmitting,
    addOrder,
    removeOrder,
    refreshOrders: fetchOrders,
  };
}

export function usePendingLabOrders(autoRefresh = false) {
  const t = useTranslations('technicianWorklist.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const { execute, isLoading } = useApiHandler();

  const fetchPendingOrders = useCallback(async () => {
    await execute(
      async () => {
        const data = await labOrdersApi.getPendingOrders();
        setOrders(data);
      },
      { errorFallbackMsg: t('fetchError') }
    );
  }, [t, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchPendingOrders();
    }, 0);
    
    if (autoRefresh) {
      const intervalId = setInterval(fetchPendingOrders, 30000);
      return () => {
        clearTimeout(timer);
        clearInterval(intervalId);
      };
    }
    return () => clearTimeout(timer);
  }, [fetchPendingOrders, autoRefresh]);

  return {
    orders,
    isLoading,
    refetch: fetchPendingOrders,
  };
}

export function useReadyLabOrders(autoRefresh = false) {
  const t = useTranslations('technicianWorklist.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const { execute, isLoading } = useApiHandler();

  const fetchReadyOrders = useCallback(async () => {
    await execute(
      async () => {
        const data = await labOrdersApi.getReadyToPerformOrders();
        setOrders(data);
      },
      { errorFallbackMsg: t('fetchPendingError') }
    );
  }, [t, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchReadyOrders();
    }, 0);
    
    if (autoRefresh) {
      const intervalId = setInterval(fetchReadyOrders, 30000);
      return () => {
        clearTimeout(timer);
        clearInterval(intervalId);
      };
    }
    return () => clearTimeout(timer);
  }, [fetchReadyOrders, autoRefresh]);

  return {
    orders,
    isLoading,
    refetch: fetchReadyOrders,
  };
}

export function useLabOrder(orderId: string) {
  const t = useTranslations('technicianWorklist.messages');
  const [order, setOrder] = useState<LabOrder | null>(null);
  const { execute, isLoading } = useApiHandler();

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    await execute(
      async () => {
        const data = await labOrdersApi.getOrderById(orderId);
        setOrder(data);
      },
      { errorFallbackMsg: t('fetchSingleError') }
    );
  }, [orderId, t, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchOrder();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchOrder, t]);

  return {
    order,
    isLoading,
    refetch: fetchOrder,
  };
}

export function useLabOrderActions() {
  const t = useTranslations('technicianWorklist.messages');
  const { execute: executeUpload, isLoading: isUploading } = useApiHandler();
  const { execute: executeSubmit, isLoading: isSubmitting } = useApiHandler();

  const uploadFile = async (file: File): Promise<string | null> => {
    const res = await executeUpload(
      async () => {
        return await labOrdersApi.uploadResultFile(file);
      },
      { onError: () => {} }
    );
    return res || null;
  };

  const submitResult = async (orderId: string, data: UploadLabResultDto) => {
    const res = await executeSubmit(
      async () => {
        await labOrdersApi.addResult(orderId, data);
        return true;
      }
    );
    return res === true; // throws on error unless onError is caught, but original threw on error.
  };

  const updateStatus = async (orderId: string, status: LabOrder['status']) => {
    const res = await executeSubmit(
      async () => {
        await labOrdersApi.updateOrderStatus(orderId, status);
        return true;
      },
      { errorFallbackMsg: t('statusUpdateError') }
    );
    return res === true; 
  };

  return { uploadFile, submitResult, updateStatus, isUploading, isSubmitting };
}

export function useTechnicianStats(autoRefresh = false) {
  const [stats, setStats] = useState<{ pending: number; inProgress: number; completedToday: number }>({
    pending: 0,
    inProgress: 0,
    completedToday: 0,
  });
  const { execute, isLoading } = useApiHandler();

  const fetchStats = useCallback(async () => {
    await execute(
      async () => {
        const data = await labOrdersApi.getTechnicianStats();
        setStats(data);
      },
      { showErrorToast: false, onError: () => {} } // Matches original standard error catch ignoring
    );
  }, [execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchStats();
    }, 0);
    
    if (autoRefresh) {
      const intervalId = setInterval(fetchStats, 30000);
      return () => {
        clearTimeout(timer);
        clearInterval(intervalId);
      };
    }
    return () => clearTimeout(timer);
  }, [fetchStats, autoRefresh]);

  return { stats, isLoading, refetch: fetchStats };
}

export function useTechnicianHistory() {
  const t = useTranslations('technicianWorklist.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const { execute, isLoading } = useApiHandler();

  const fetchHistory = useCallback(async () => {
    await execute(
      async () => {
        const data = await labOrdersApi.getTechnicianHistory();
        setOrders(data);
      },
      { errorFallbackMsg: t('fetchHistoryError') }
    );
  }, [t, execute]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchHistory, t]);

  return { orders, isLoading, refetch: fetchHistory };
}
