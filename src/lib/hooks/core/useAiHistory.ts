'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiApi, type AiSessionSummary, type AiSessionDetail } from '@/lib/api/ai';

export function useAiHistory() {
  const [sessions, setSessions] = useState<AiSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await aiApi.listSessions(1, 30);
      setSessions(res.data || []);
      setTotal(res.meta?.total || 0);
    } catch {
      // Silent — sidebar shouldn't block main chat
      setSessions([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSessions();
  }, [fetchSessions]);

  return { sessions, isLoading, total, refetch: fetchSessions };
}

export function useAiSessionMessages(sessionId: string | null) {
  const [detail, setDetail] = useState<AiSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      if (!active) return;

      if (!sessionId) {
        setDetail(null);
        return;
      }

      setIsLoading(true);
      aiApi
        .getSessionMessages(sessionId)
        .then((data) => {
          if (active) setDetail(data);
        })
        .catch(() => {
          if (active) setDetail(null);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, [sessionId]);

  return { detail, isLoading };
}
