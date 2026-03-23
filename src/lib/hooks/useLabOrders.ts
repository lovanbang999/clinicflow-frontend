import { useState, useCallback, useEffect } from 'react';
import { labOrdersApi, type LabOrder, type CreateLabOrderDto, type UploadLabResultDto } from '../api/lab-orders';
import { toast } from 'sonner';

export function useLabOrders(bookingId: string) {
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
      toast.error('Lỗi khi tải danh sách phiếu xét nghiệm');
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const addOrder = async (dto: Omit<CreateLabOrderDto, 'bookingId'>) => {
    try {
      setIsSubmitting(true);
      const newOrder = await labOrdersApi.createOrder({ ...dto, bookingId });
      setOrders((prev) => [newOrder, ...prev]);
      toast.success('Chỉ định xét nghiệm thành công');
      return true;
    } catch (error) {
      console.error(error);
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || 'Có lỗi xảy ra khi tạo chỉ định';
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
      toast.success('Đã hủy phiếu chỉ định');
    } catch (error) {
      console.error(error);
      const e = error as { response?: { data?: { message?: string } } };
      const msg = e.response?.data?.message || 'Lỗi khi hủy phiếu xét nghiệm';
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
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getPendingOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching pending lab orders:', error);
      toast.error('Lỗi khi tải danh sách phiếu xét nghiệm');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPendingOrders();
    if (autoRefresh) {
      const intervalId = setInterval(fetchPendingOrders, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchPendingOrders, autoRefresh]);

  return {
    orders,
    isLoading,
    refetch: fetchPendingOrders,
  };
}

export function useReadyLabOrders(autoRefresh = false) {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReadyOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await labOrdersApi.getReadyToPerformOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching ready lab orders:', error);
      toast.error('Lỗi khi tải danh sách phiếu cần thực hiện');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReadyOrders();
    if (autoRefresh) {
      const intervalId = setInterval(fetchReadyOrders, 30000);
      return () => clearInterval(intervalId);
    }
  }, [fetchReadyOrders, autoRefresh]);

  return {
    orders,
    isLoading,
    refetch: fetchReadyOrders,
  };
}

export function useLabOrder(orderId: string) {
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
      toast.error('Lỗi khi lấy thông tin chỉ định');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    isLoading,
    refetch: fetchOrder,
  };
}

export function useLabOrderActions() {
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
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { uploadFile, submitResult, updateStatus, isUploading, isSubmitting };
}
