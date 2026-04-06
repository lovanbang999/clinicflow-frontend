"use client";

import React from 'react';
import { useChatStream } from '@/lib/hooks/core/useChatStream';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useTranslations } from 'next-intl';
import { Send, Bot, Stethoscope, CalendarClock, MessageCircleHeart, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  { icon: Stethoscope, label: 'Đau đầu, chóng mặt', prompt: 'Tôi đang bị đau đầu và chóng mặt' },
  { icon: CalendarClock, label: 'Đặt lịch khám', prompt: 'Tôi muốn đặt lịch khám bệnh' },
  { icon: MessageCircleHeart, label: 'Tư vấn chuyên khoa', prompt: 'Cho tôi biết tôi nên khám chuyên khoa nào?' },
];

export default function ChatPage() {
  const t = useTranslations('chat');
  const { messages, sendMessage, isLoading } = useChatStream();
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Smooth auto-scroll on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage(trimmed);
    setInput('');
    // Refocus input on mobile after submit
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] dark:bg-[#0F172A]">

      {/* ── Header ── */}
      <div className="relative bg-blue-600 text-white px-4 pt-4 pb-6 shadow-md flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base leading-tight">{t('title')}</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse flex-shrink-0" />
              <p className="text-xs text-white/80 font-medium truncate">{t('status')}</p>
            </div>
          </div>
        </div>
        {/* Wave bottom */}
        <svg className="absolute -bottom-px left-0 w-full" viewBox="0 0 1440 20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,10 C360,20 1080,0 1440,10 L1440,20 L0,20 Z" fill="rgb(248,250,252)" className="dark:fill-[#0F172A]" />
        </svg>
      </div>

      {/* ── Message area ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 pt-4 pb-2">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Welcome bubble from AI */}
          <div className="flex flex-col gap-1 max-w-[88%]">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('aiName')}</span>
              <span className="text-[10px] text-muted-foreground">{t('today')}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-800 dark:text-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed">
              {t('welcome')}
            </div>
          </div>

          {/* Chat messages */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              isStreaming={msg.isStreaming}
            />
          ))}

          {/* Quick prompt chips — only when no messages yet */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-xs text-muted-foreground text-center mb-1 font-medium">Gợi ý câu hỏi</p>
              <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center">
                {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all shadow-sm active:scale-[0.98] cursor-pointer text-left"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* ── Safety Warning ── */}
      <div className="px-4 py-2 flex items-center justify-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-100 dark:border-amber-900/50 flex-shrink-0">
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        <span className="text-center leading-tight">{t('warning')}</span>
      </div>

      {/* ── Input area ── */}
      <div className="px-3 sm:px-4 pb-safe-or-4 pb-4 pt-3 bg-[#F8FAFC] dark:bg-[#0F172A] border-t dark:border-slate-800 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className={cn(
            "flex items-end gap-2 bg-white dark:bg-slate-800 rounded-2xl border dark:border-slate-700 shadow-md px-4 py-2 transition-all duration-200",
            "focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-400"
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                // Auto-grow (max 4 lines)
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder={t('placeholder')}
              className="flex-1 resize-none bg-transparent border-0 focus:outline-none text-sm placeholder:text-muted-foreground text-slate-800 dark:text-slate-100 py-1.5 leading-relaxed min-h-[28px]"
              style={{ maxHeight: '96px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mb-0.5 transition-all active:scale-95 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
