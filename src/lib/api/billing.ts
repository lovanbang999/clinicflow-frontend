import { apiClient } from './client';
import { ApiResponse } from '@/types';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  INSURANCE = 'INSURANCE',
  E_WALLET = 'E_WALLET',
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isLab: boolean;
  labOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  isInsurance: boolean;
  labOrderId?: string;
  createdAt: string;
}

export interface InvoiceBooking {
  id: string;
  patientProfile?: {
    fullName: string;
    patientCode?: string;
    phone?: string;
  };
  doctor?: {
    fullName: string;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  status: InvoiceStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  patientCoPayment: number;
  insuranceAmount: number;
  notes?: string;
  issuedAt?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  payments: Payment[];
  booking?: InvoiceBooking;
}

export interface AddPaymentDto {
  amountPaid: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  isInsurance?: boolean;
  labOrderId?: string;
}

export interface ListInvoicesParams {
  status?: InvoiceStatus;
  patientProfileId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const billingApi = {
  // List invoices
  listInvoices: async (params?: ListInvoicesParams): Promise<{ invoices: Invoice[], pagination: Record<string, unknown> }> => {
    // Note: Depends on backend returning { data: { invoices, pagination } } or just { data: Invoice[] }.
    // Let's assume standard { data: { invoices: Invoice[], pagination: any } } or similar.
    const response = await apiClient.get<ApiResponse<{ invoices?: Invoice[], pagination?: Record<string, unknown> }>>('/billing/invoices', { params });
    // Handle both cases dynamically depending on what backend returns
    if (response.data.data?.invoices) {
      return response.data.data as { invoices: Invoice[], pagination: Record<string, unknown> };
    }
    return { invoices: response.data.data as unknown as Invoice[], pagination: {} };
  },

  // Get invoice by Booking ID
  getInvoiceByBooking: async (bookingId: string): Promise<Invoice | null> => {
    try {
      const response = await apiClient.get<ApiResponse<Invoice>>(`/billing/invoices/booking/${bookingId}`);
      return response.data.data ?? null;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/billing/invoices/${invoiceId}`);
    return response.data.data as Invoice;
  },

  // Add a payment
  addPayment: async (invoiceId: string, data: AddPaymentDto): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/billing/invoices/${invoiceId}/payments`, data);
    return response.data.data as Invoice;
  },

  // Finalize an invoice
  finalizeInvoice: async (invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/billing/invoices/${invoiceId}/finalize`);
    return response.data.data as Invoice;
  },
};
