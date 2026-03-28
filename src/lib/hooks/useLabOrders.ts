import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { labOrdersApi, type LabOrder, type CreateLabOrderDto, type UploadLabResultDto } from '../api/lab-orders';
import { toast } from 'sonner';

export function useLabOrders(bookingId: string) {
  const t = useTranslations('dashboard.technician.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!bookingId) return;
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getOrdersByBooking(bookingId);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching lab orders:', error);
      toast.error(t('fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, t]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders, t]);

  const addOrder = async (dto: Omit<CreateLabOrderDto, 'bookingId'>) => {
    try {
      setIsSubmitting(true);
      const newOrder = await labOrdersApi.createOrder({ ...dto, bookingId });
      setOrders((prev) => [newOrder, ...prev]);
      toast.success(t('createSuccess'));
      return true;
    } catch (error) {
      console.error(error);
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || t('createError');
      toast.error(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeOrder = async (id: string) => {
    try {
      await labOrdersApi.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success(t('cancelSuccess'));
    } catch (error) {
      console.error(error);
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || t('cancelError');
      toast.error(msg);
    }
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
  const t = useTranslations('dashboard.technician.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getPendingOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching pending lab orders:', error);
      toast.error(t('fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchPendingOrders();
    if (autoRefresh) {
      const intervalId = setInterval(fetchPendingOrders, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchPendingOrders, autoRefresh, t]);

  return {
    orders,
    isLoading,
    refetch: fetchPendingOrders,
  };
}

export function useReadyLabOrders(autoRefresh = false) {
  const t = useTranslations('dashboard.technician.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReadyOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getReadyToPerformOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching ready lab orders:', error);
      toast.error(t('fetchPendingError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchReadyOrders();
    if (autoRefresh) {
      const intervalId = setInterval(fetchReadyOrders, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchReadyOrders, autoRefresh, t]);

  return {
    orders,
    isLoading,
    refetch: fetchReadyOrders,
  };
}

export function useLabOrder(orderId: string) {
  const t = useTranslations('dashboard.technician.messages');
  const [order, setOrder] = useState<LabOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getOrderById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Error fetching lab order:', error);
      toast.error(t('fetchSingleError'));
    } finally {
      setIsLoading(false);
    }
  }, [orderId, t]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder, t]);

  return {
    order,
    isLoading,
    refetch: fetchOrder,
  };
}

export function useLabOrderActions() {
  const t = useTranslations('dashboard.technician.messages');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      return await labOrdersApi.uploadResultFile(file);
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const submitResult = async (orderId: string, data: UploadLabResultDto) => {
    try {
      setIsSubmitting(true);
      await labOrdersApi.addResult(orderId, data);
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (orderId: string, status: LabOrder['status']) => {
    try {
      setIsSubmitting(true);
      await labOrdersApi.updateOrderStatus(orderId, status);
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t('statusUpdateError'));
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { uploadFile, submitResult, updateStatus, isUploading, isSubmitting };
}

export function useTechnicianStats(autoRefresh = false) {
  const [stats, setStats] = useState<{ pending: number; inProgress: number; completedToday: number }>({
    pending: 0,
    inProgress: 0,
    completedToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getTechnicianStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching technician stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
    if (autoRefresh) {
      const intervalId = setInterval(fetchStats, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchStats, autoRefresh]);

  return { stats, isLoading, refetch: fetchStats };
}

export function useTechnicianHistory() {
  const t = useTranslations('dashboard.technician.messages');
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getTechnicianHistory();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching technician history:', error);
      toast.error(t('fetchHistoryError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory, t]);

  return { orders, isLoading, refetch: fetchHistory };
}
