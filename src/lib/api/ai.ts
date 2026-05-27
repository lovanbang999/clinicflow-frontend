import { apiClient } from '@/lib/api/core/client';

export interface AiSessionSummary {
  id: string;
  startedAt: string;
  endedAt: string | null;
  outcome: 'ONGOING' | 'BOOKING_MADE' | 'ABANDONED' | 'REPORTED';
  totalTokens: number;
  messageCount: number;
  firstMessage: string | null;
}

export interface AiMessage {
  id: string;
  role: 'USER' | 'MODEL' | 'TOOL';
  content: string;
  toolName: string | null;
  createdAt: string;
}

export interface AiSessionDetail {
  session: {
    id: string;
    startedAt: string;
    endedAt: string | null;
    outcome: string;
  };
  messages: AiMessage[];
}

export const aiApi = {
  listSessions: async (
    page = 1,
    limit = 30,
  ): Promise<{ data: AiSessionSummary[]; meta: { total: number } }> => {
    const response = await apiClient.get<{
      data: { data: AiSessionSummary[]; meta: { total: number } };
    }>('/ai/sessions', { params: { page, limit } });
    return response.data.data;
  },

  getSessionMessages: async (sessionId: string): Promise<AiSessionDetail> => {
    const response = await apiClient.get<{
      data: { data: AiSessionDetail };
    }>(`/ai/session/${sessionId}/messages`);
    return response.data.data.data;
  },
};
