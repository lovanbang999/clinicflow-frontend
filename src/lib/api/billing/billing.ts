import { apiClient } from '@/lib/api/core/client';
import { ApiResponse } from '@/types';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum InvoiceType {
  CONSULTATION = 'CONSULTATION', // Phiếu thu tiền khám
  LAB = 'LAB',                  // Phiếu thu tiền cận lâm sàng / XN
  PHARMACY = 'PHARMACY',         // Phiếu thu tiền thuốc
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
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isLab: boolean;
  labOrderId?: string;
  createdAt: string;
  updatedAt: string;
  labOrder?: LabOrderForBilling;
  visitServiceOrder?: VisitServiceOrderForBilling;
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
  status?: string;
  patientProfile?: {
    id: string;
    fullName: string;
    patientCode?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  doctor?: {
    fullName: string;
  };
  service?: {
    id: string;
    name: string;
  };
  queueRecord?: {
    queuePosition: number;
    estimatedWaitMinutes: number;
  };
  room?: {
    id: string;
    name: string;
  };
  medicalRecord?: {
    id: string;
    visitStep: string;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  invoiceType: InvoiceType;
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

export interface CreateInvoiceDto {
  bookingId: string;
  invoiceType?: InvoiceType;
  notes?: string;
  labOrderIds?: string[];
  items?: AddInvoiceItemDto[];
}

export interface LabOrderForBilling {
  id: string;
  bookingId: string;
  testName: string;
  testDescription?: string;
  status: string;
  queueNumber?: number;
  roomName?: string;
  orderedAt: string;
  createdAt: string;
}

export interface VisitServiceOrderForBilling {
  id: string;
  status: string;
  queueNumber?: number;
  performer?: {
    id: string;
    fullName: string;
  };
  service?: {
    id: string;
    name: string;
  };
}

export interface AddPaymentDto {
  amountPaid: number;
  paymentMethod: PaymentMethod;
  /** BHYT: amount covered by insurance */
  insuranceCovered?: number;
  /** BHYT: patient insurance card number */
  insuranceNumber?: string;
  transactionRef?: string;
  labOrderId?: string;
  notes?: string;
}

export interface AddInvoiceItemDto {
  itemName: string;
  unitPrice: number;
  quantity?: number;
  serviceId?: string;
}

export interface ListInvoicesParams {
  status?: InvoiceStatus;
  invoiceType?: InvoiceType;
  patientProfileId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkspaceQueueItem {
  bookingId: string;
  patientName: string;
  patientCode: string;
  patientGender: string;
  patientDob: string;
  doctorName: string;
  bookingCode: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: string;
  visitStep?: string;
  currentStepCode: string; // 'B1', 'B3', 'B8'
  isUrgent: boolean;
  createdAt: string;
  invoiceTypes: InvoiceType[];
}

export interface WorkspaceKpis {
  awaitingPaymentCount: number;
  completedPaymentCount: number;
  totalRevenue: number;
  totalInvoicesValue: number;
}

export const billingApi = {
  // Workspace APIs
  getWorkspaceQueue: async (params?: { search?: string }): Promise<WorkspaceQueueItem[]> => {
    const response = await apiClient.get<ApiResponse<WorkspaceQueueItem[]>>('/billing/workspace-queue', { params });
    return response.data.data ?? [];
  },

  getWorkspaceKpis: async (): Promise<WorkspaceKpis> => {
    const response = await apiClient.get<ApiResponse<WorkspaceKpis>>('/billing/workspace-kpis');
    return response.data.data as WorkspaceKpis;
  },

  // List invoices
  listInvoices: async (params?: ListInvoicesParams): Promise<{ invoices: Invoice[], pagination: PaginationData }> => {
    const response = await apiClient.get<ApiResponse<{ invoices?: Invoice[], pagination?: PaginationData }>>('/billing/invoices', { params });
    if (response.data.data?.invoices) {
      return response.data.data as { invoices: Invoice[], pagination: PaginationData };
    }
    return { invoices: response.data.data as unknown as Invoice[], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  },

  // List all invoices for a booking (Phương án B: multiple invoices per booking)
  listInvoicesByBooking: async (bookingId: string): Promise<Invoice[]> => {
    const response = await apiClient.get<ApiResponse<Invoice[]>>(`/billing/invoices/booking/${bookingId}`);
    return response.data.data ?? [];
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId: string): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/billing/invoices/${invoiceId}`);
    return response.data.data as Invoice;
  },

  // Create a new invoice for a booking
  createInvoice: async (data: CreateInvoiceDto): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>('/billing/invoices', data);
    return response.data.data as Invoice;
  },

  // Add a payment
  addPayment: async (invoiceId: string, data: AddPaymentDto): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/billing/invoices/${invoiceId}/payments`, data);
    return response.data.data as Invoice;
  },

  deleteInvoice: async (id: string): Promise<void> => {
    await apiClient.delete(`/billing/invoices/${id}`);
  },

  // Add a line item to a DRAFT/OPEN invoice
  addItemToInvoice: async (invoiceId: string, data: AddInvoiceItemDto): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/billing/invoices/${invoiceId}/items`, data);
    return response.data.data as Invoice;
  },

  // Remove a line item from a DRAFT/OPEN invoice
  removeItemFromInvoice: async (invoiceId: string, itemId: string): Promise<void> => {
    await apiClient.delete(`/billing/invoices/${invoiceId}/items/${itemId}`);
  },

  // Finalize an invoice (manual fallback)
  finalizeInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/billing/invoices/${id}/finalize`);
    return response.data.data as Invoice;
  },

  // Get PENDING lab orders for a booking not yet in any invoice (for billing alert banner)
  getPendingLabOrdersForBilling: async (bookingId: string): Promise<LabOrderForBilling[]> => {
    const response = await apiClient.get<ApiResponse<LabOrderForBilling[]>>(
      `/billing/invoices/booking/${bookingId}/pending-labs`,
    );
    return response.data.data ?? [];
  },

  // List invoices for the logged-in patient
  listMyInvoices: async (params?: ListInvoicesParams): Promise<{ invoices: Invoice[], pagination: Record<string, unknown> }> => {
    const response = await apiClient.get<ApiResponse<{ invoices?: Invoice[], pagination?: Record<string, unknown> }>>('/billing/my-invoices', { params });
    if (response.data.data?.invoices) {
      return response.data.data as { invoices: Invoice[], pagination: Record<string, unknown> };
    }
    return { invoices: response.data.data as unknown as Invoice[], pagination: {} };
  },
};
