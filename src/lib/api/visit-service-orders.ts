import { apiClient } from './client';
import type { VisitServiceOrder } from './medical-records';

export type { VisitServiceOrder };

export interface CompleteServiceOrderDto {
  resultText?: string;
  resultFileUrl?: string;
  isAbnormal?: boolean;
  abnormalNote?: string;
}

export const visitServiceOrdersApi = {
  getWorklist: async (status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    const res = await apiClient.get('visit-service-orders/worklist', {
      params: status ? { status } : undefined,
    });
    return res.data.data as VisitServiceOrder[];
  },

  getDetail: async (id: string) => {
    const res = await apiClient.get(`visit-service-orders/${id}`);
    return res.data.data as VisitServiceOrder;
  },

  startOrder: async (id: string) => {
    const res = await apiClient.patch(`visit-service-orders/${id}/start`);
    return res.data.data as VisitServiceOrder;
  },

  completeOrder: async (id: string, dto: CompleteServiceOrderDto) => {
    const res = await apiClient.patch(`visit-service-orders/${id}/complete`, dto);
    return res.data.data as VisitServiceOrder;
  },
};
