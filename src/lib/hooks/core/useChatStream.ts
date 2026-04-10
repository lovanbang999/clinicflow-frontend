import { useState, useCallback, useRef } from 'react';

export interface SlotData {
  slotId: string;
  doctorId: string;
  doctorName: string;
  specialties?: string[];
  date: string;
  startTime: string;
  endTime: string;
  roomName?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
  /** Slots to display with SlotPicker if the AI returned available slots */
  slots?: SlotData[];
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

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

      // Snapshot history (all messages before the new user one)
      const history = messagesRef.current.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
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

                // Handle slotsData event — attach slots to the current bot message
                if (parsed?.slotsData && Array.isArray(parsed.slotsData)) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === botMsgId
                        ? { ...m, slots: parsed.slotsData as SlotData[] }
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
      console.error('Chat stream error', e);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId && !m.content
            ? { ...m, content: 'Xin lỗi, đã có lỗi xảy ra.', isStreaming: false }
            : { ...m, isStreaming: false },
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear current chat — calls PATCH /ai/session/:id/end then resets local state.
   */
  const clearChat = useCallback(async () => {
    const currentSessionId = sessionIdRef.current;
    if (currentSessionId) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
