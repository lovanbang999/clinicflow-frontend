'use client';

import React, { useState, useCallback, createContext, useContext } from 'react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { useAiHistory } from '@/lib/hooks/core/useAiHistory';
import { useParams } from 'next/navigation';

// Create a context so pages under this layout can control the sidebar
export const ChatLayoutContext = createContext<{
  setSidebarOpen: (open: boolean) => void;
}>({
  setSidebarOpen: () => {},
});

export const useChatLayout = () => useContext(ChatLayoutContext);

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sessions, isLoading, refetch } = useAiHistory();

  // Detect active session from URL (/patient/chat/[sessionId])
  const params = useParams();
  const activeSessionId = typeof params?.sessionId === 'string' ? params.sessionId : null;

  const handleNewChat = useCallback(() => {
    // Refetch so new session appears after creation
    setTimeout(() => void refetch(), 800);
  }, [refetch]);

  return (
    <ChatLayoutContext.Provider value={{ setSidebarOpen }}>
      <div className="flex h-full w-full overflow-hidden">
        {/* Mobile floating hamburger button removed! Integrated into mobile header inside pages instead. */}

        <ChatSidebar
          sessions={sessions}
          isLoading={isLoading}
          activeSessionId={activeSessionId}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNewChat={handleNewChat}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-[#f8fafc] dark:bg-slate-950">
          {children}
        </div>
      </div>
    </ChatLayoutContext.Provider>
  );
}
