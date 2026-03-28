import { apiClient } from './client';

export interface LabResult {
  id: string;
  resultText?: string;
  resultFileUrl?: string;
  isAbnormal?: boolean;
  abnormalNote?: string;
  recordedBy: string;
  resultDate: string;
}

export interface LabOrder {
  id: string;
  bookingId: string;
  testName: string;
  testDescription?: string;
  status: 'PENDING' | 'PAID' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  orderedAt: string;
  result?: LabResult;
  // Included in pending lists
  patientProfile?: {
    fullName: string;
    patientCode: string;
    gender?: string;
    dateOfBirth?: string;
  };
  booking?: {
    bookingCode: string;
    doctor: { fullName: string };
  };
}

export interface CreateLabOrderDto {
  bookingId: string;
  testName: string;
  testDescription?: string;
  serviceId?: string;
}

export interface UploadLabResultDto {
  resultText?: string;
  resultFileUrl?: string;
  isAbnormal?: boolean;
  abnormalNote?: string;
}

export const labOrdersApi = {
  createOrder: async (data: CreateLabOrderDto): Promise<LabOrder> => {
    const response = await apiClient.post('/lab-orders', data);
    return response.data.data;
  },

  getOrdersByBooking: async (bookingId: string): Promise<LabOrder[]> => {
    const response = await apiClient.get(`/lab-orders/booking/${bookingId}`);
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<LabOrder> => {
    const response = await apiClient.get(`/lab-orders/${id}`);
    return response.data.data;
  },

  getPendingOrders: async (): Promise<LabOrder[]> => {
    const response = await apiClient.get('/lab-orders/pending');
    return response.data.data;
  },

  getReadyToPerformOrders: async (): Promise<LabOrder[]> => {
    const response = await apiClient.get('/lab-orders/pending-ready');
    return response.data.data;
  },

  getTechnicianStats: async (): Promise<{ pending: number; inProgress: number; completedToday: number }> => {
    const response = await apiClient.get('/lab-orders/technician/stats');
    return response.data.data;
  },

  getTechnicianHistory: async (): Promise<LabOrder[]> => {
    const response = await apiClient.get('/lab-orders/technician/history');
    return response.data.data;
  },

  updateOrderStatus: async (
    labOrderId: string,
    status: LabOrder['status'],
  ): Promise<LabOrder> => {
    const response = await apiClient.patch(`/lab-orders/${labOrderId}/status`, {
      status,
    });
    return response.data.data;
  },

  addResult: async (labOrderId: string, data: UploadLabResultDto): Promise<LabOrder> => {
    const response = await apiClient.patch(`/lab-orders/${labOrderId}/result`, data);
    return response.data.data;
  },

  deleteOrder: async (labOrderId: string): Promise<void> => {
    await apiClient.delete(`/lab-orders/${labOrderId}`);
  },

  uploadResultFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload/lab-result', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.url;
  },
};
