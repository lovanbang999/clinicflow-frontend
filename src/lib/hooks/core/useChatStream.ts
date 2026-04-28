import { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/lib/store/authStore';

export interface SlotData {
  slotId: string;
  doctorId: string;
  doctorName: string;
  specialties?: string[];
  serviceId?: string;
  date: string;
  startTime: string;
  endTime: string;
  roomName?: string;
}

export interface SlotMetadata {
  searchedDate?: string;
  foundCount?: number;
  isFallbackSuggestions?: boolean;
  message?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
  /** Slots to display with SlotPicker if the AI returned available slots */
  slots?: SlotData[];
  slotsMetadata?: SlotMetadata;
}

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Keep a ref so callbacks always read the latest values without stale closures
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;
  const sessionIdRef = useRef<string | null>(null);
  sessionIdRef.current = sessionId;

  const sendMessage = useCallback(async (content: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: botMsgId, role: 'model', content: '', isStreaming: true }]);

    const controller = new AbortController();
    // 55-second hard timeout: kills hung stream
    const timeoutId = setTimeout(() => controller.abort(), 55_000);

    try {
      const { accessToken: token } = useAuthStore.getState();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

      // Snapshot history: exclude the current user message and any streaming/empty bot placeholders
      const history = messagesRef.current
        .filter((m) => m.id !== userMsg.id && m.content.trim() !== '')
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.content }],
        }));

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          history,
          message: content,
          // Send existing sessionId so backend reuses the same session
          ...(sessionIdRef.current ? { sessionId: sessionIdRef.current } : {}),
        }),
      });

      // Read the sessionId from the response header on first message
      const returnedSessionId = response.headers.get('X-Session-Id');
      if (returnedSessionId && !sessionIdRef.current) {
        setSessionId(returnedSessionId);
        sessionIdRef.current = returnedSessionId;
      }

      if (!response.body) throw new Error('No readable stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let partialLine = '';
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? { ...m, isStreaming: false } : m)),
          );
          break;
        }

        const decodedChunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + decodedChunk).split('\n');
        partialLine = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (dataStr) {
              try {
                const parsed = JSON.parse(dataStr);

                // Handle slotsData event — attach slots + metadata to the current bot message
                if (parsed?.slotsData && Array.isArray(parsed.slotsData)) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botMsgId
                        ? {
                            ...m,
                            slots: parsed.slotsData as SlotData[],
                            slotsMetadata: parsed.metadata as SlotMetadata | undefined,
                          }
                        : m,
                    ),
                  );
                  continue;
                }

                // Handle text chunk event
                const text: string = parsed?.data?.text || parsed?.text || '';
                if (text) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botMsgId ? { ...m, content: m.content + text } : m,
                    ),
                  );
                }
              } catch {
                // Ignore malformed SSE frames
              }
            }
          }
        }
      }
    } catch (e) {
      const isTimeout = e instanceof DOMException && e.name === 'AbortError';
      const fallback = isTimeout
        ? 'Phản hồi quá lâu. Vui lòng thử lại hoặc đặt câu hỏi ngắn gọn hơn.'
        : 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.';
      console.error('Chat stream error', e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId && !m.content
            ? { ...m, content: fallback, isStreaming: false }
            : { ...m, isStreaming: false },
        ),
      );
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear current chat — calls PATCH /ai/session/:id/end then resets local state.
   */
  const clearChat = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (currentSessionId) {
      const { accessToken: token } = useAuthStore.getState();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      // Fire-and-forget — don't block UI on network call
      void fetch(`${API_BASE_URL}/ai/session/${currentSessionId}/end`, {
        method: 'PATCH',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      }).catch(() => {});
    }
    setMessages([]);
    setSessionId(null);
  }, []);

  /**
   * Report the current session — calls POST /ai/session/:id/report.
   */
  const reportSession = useCallback(async (note?: string) => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId) return;

    const { accessToken: token } = useAuthStore.getState();
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

    await fetch(`${API_BASE_URL}/ai/session/${currentSessionId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ note }),
    });
  }, []);

  return { messages, sendMessage, isLoading, clearChat, reportSession, sessionId };
}

