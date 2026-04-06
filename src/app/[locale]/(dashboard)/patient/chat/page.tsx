"use client";

import React from 'react';
import { useChatStream } from '@/lib/hooks/core/useChatStream';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useTranslations } from 'next-intl';
import { Send, Bot, Stethoscope, CalendarClock, MessageCircleHeart, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans selection:bg-blue-500/30">

      {/* Header */}
      <div className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-4 py-3 sm:py-3.5 flex-shrink-0 sticky top-0 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-start gap-2.5 sm:gap-3">
          <Link href="/patient" className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95 flex-shrink-0">
            <ArrowLeft className="h-[22px] w-[22px]" />
          </Link>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
            <Bot className="h-[22px] w-[22px] text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full z-10" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <h1 className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] pt-0.5">{t('title')}</h1>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium tracking-wide mt-1">{t('status')}</p>
          </div>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-6 pb-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Welcome bubble from AI */}
          <div className="flex flex-col gap-1.5 max-w-[85%] mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-blue-600 tracking-wide">{t('aiName')}</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{t('today')}</span>
            </div>
            <div className="w-fit bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-5 py-3.5 rounded-[20px] rounded-tl-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 text-[15px] leading-relaxed max-w-full">
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
            <div className="flex flex-col gap-4 mt-8 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-700/50" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold tracking-widest uppercase">Gợi ý bắt đầu</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-700/50" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }, i) => (
                  <button
                    key={label}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="group relative flex flex-col items-center justify-center gap-2 p-5 rounded-[20px] bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-[0_8px_24px_rgba(37,99,235,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-50/80 dark:bg-slate-700/80 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-slate-600 transition-colors duration-300">
                      <Icon className="h-[22px] w-[22px] text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </div>

      {/* Safety Warning */}
      <div className="px-4 py-2 flex items-center justify-center gap-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-t border-amber-100 dark:border-amber-900/50 flex-shrink-0">
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        <span className="text-center leading-tight">{t('warning')}</span>
      </div>

      {/* Input area */}
      <div className="relative z-10 px-4 pb-safe-or-4 pb-6 pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className={cn(
            "relative flex items-end gap-2 bg-white dark:bg-slate-800 rounded-[28px] border border-slate-200/80 dark:border-slate-700 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-all duration-300 pl-5 pr-2 py-2",
            "focus-within:shadow-[0_8px_30px_rgba(37,99,235,0.12)] focus-within:border-blue-300 dark:focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10"
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder={t('placeholder')}
              className="flex-1 resize-none bg-transparent border-0 focus:outline-none text-[15px] placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 py-2.5 leading-relaxed min-h-[44px]"
              style={{ maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-[20px] bg-blue-600 text-white flex items-center justify-center flex-shrink-0 transition-all shadow-sm active:scale-95 hover:bg-blue-700 disabled:opacity-40 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer group"
            >
              <Send className="h-[18px] w-[18px] ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
