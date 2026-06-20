"use client";

import React from 'react';
import { useChatStream } from '@/lib/hooks/core/useChatStream';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { Slot } from '@/components/chat/SlotPicker';
import { useTranslations } from 'next-intl';
import { Send, Bot, Stethoscope, CalendarClock, MessageCircleHeart, AlertTriangle, ClipboardList, Pill, Activity, Menu, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useChatLayout } from './layout';

const QUICK_PROMPTS = [
  { icon: Stethoscope, labelKey: 'quickPrompt1Label', promptKey: 'quickPrompt1Prompt' },
  { icon: CalendarClock, labelKey: 'quickPrompt2Label', promptKey: 'quickPrompt2Prompt' },
  { icon: ClipboardList, labelKey: 'quickPrompt3Label', promptKey: 'quickPrompt3Prompt' },
  { icon: MessageCircleHeart, labelKey: 'quickPrompt4Label', promptKey: 'quickPrompt4Prompt' },
  { icon: Activity, labelKey: 'quickPrompt5Label', promptKey: 'quickPrompt5Prompt' },
  { icon: Pill, labelKey: 'quickPrompt6Label', promptKey: 'quickPrompt6Prompt' },
];

export default function ChatPage() {
  const t = useTranslations('chat');
  const { setSidebarOpen } = useChatLayout();
  const { messages, sendMessage, isLoading, clearChat } = useChatStream();
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

  /** When user clicks a slot card, auto-send a structured booking command */
  const handleSelectSlot = (slot: Slot) => {
    const lines = [
      t('confirmBookingPrefix'),
      t('confirmBookingDoctor', { doctorName: slot.doctorName }),
      t('confirmBookingDateTime', { date: slot.date, startTime: slot.startTime, endTime: slot.endTime }),
      slot.roomName ? t('confirmBookingRoom', { roomName: slot.roomName }) : '',
      `<<BOOK doctorId="${slot.doctorId}" slotId="${slot.slotId}" serviceId="${slot.serviceId || 'unknown'}" date="${slot.date}" startTime="${slot.startTime}" endTime="${slot.endTime}">>`,
    ].filter(Boolean);
    sendMessage(lines.join('\n'));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 selection:bg-[#1392ec]/20">

      {/* Header - Hidden on Desktop to avoid redundancy with the sidebar */}
      <div className="relative z-10 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 px-3 py-3 flex-shrink-0 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 h-9 w-9 flex-shrink-0"
              aria-label={t('openHistory')}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#1392ec] to-[#0e7bcc] shadow-sm flex-shrink-0">
              <Bot className="h-5.5 w-5.5 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full z-10 animate-pulse" />
            </div>
            <div className="flex flex-col ml-1">
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-[14px] leading-tight tracking-tight">{t('title')}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold uppercase tracking-wider">{t('status')}</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => void clearChat()}
              className="h-9 w-9 rounded-xl text-slate-500 hover:text-[#1392ec] hover:bg-blue-50/80 hover:border-blue-200 active:scale-95 border-slate-200 flex-shrink-0 flex items-center justify-center p-0"
              title={t('clearChat')}
            >
              <Plus className="h-4.5 w-4.5" />
            </Button>
          )}
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
              slots={msg.slots}
              slotsMetadata={msg.slotsMetadata}
              onSelectSlot={handleSelectSlot}
            />
          ))}

          {/* Quick prompt chips — only when no messages yet */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col gap-6 mt-12 pb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800" />
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-[0.2em] uppercase">
                  {t('aiSuggestions', { aiName: t('aiName') })}
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {QUICK_PROMPTS.map(({ icon: Icon, labelKey, promptKey }, i) => (
                  <button
                    key={labelKey}
                    onClick={() => handleQuickPrompt(t(promptKey))}
                    className="group relative flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#1392ec]/30 dark:hover:border-[#1392ec]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-[#1392ec]/10 flex items-center justify-center group-hover:bg-[#1392ec] transition-all duration-300 shadow-sm">
                      <Icon className="h-6 w-6 text-[#1392ec] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 pt-1">
                      <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#1392ec] transition-colors">
                        {t(labelKey)}
                      </span>
                      <span className="text-[12px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1">
                        {t('exploreNow')}
                      </span>
                    </div>
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
      <div className="relative z-10 px-4 pb-safe-or-4 pb-8 pt-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className={cn(
            "relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 rounded-[24px] border border-slate-200/50 dark:border-slate-800 transition-all duration-300 pl-5 pr-2 py-2.5",
            "focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:border-[#1392ec] focus-within:ring-4 focus-within:ring-[#1392ec]/10 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
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
              className="flex-1 resize-none bg-transparent border-0 focus:outline-none text-[15px] font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-800 dark:text-slate-100 py-2 leading-relaxed min-h-[40px]"
              style={{ maxHeight: '120px' }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              variant="default"
              size="icon"
              className="w-10 h-10 rounded-xl bg-[#1392ec] hover:bg-[#0e7bcc] text-white flex-shrink-0 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
