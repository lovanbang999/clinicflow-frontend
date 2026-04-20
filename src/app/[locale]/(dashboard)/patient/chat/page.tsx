"use client";

import React from 'react';
import { useChatStream } from '@/lib/hooks/core/useChatStream';
import { MessageBubble } from '@/components/chat/MessageBubble';
import type { Slot } from '@/components/chat/SlotPicker';
import { useTranslations } from 'next-intl';
import { Send, Bot, Stethoscope, CalendarClock, MessageCircleHeart, AlertTriangle, ArrowLeft, ClipboardList, Pill, Activity } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const QUICK_PROMPTS = [
  { icon: Stethoscope, label: 'Triệu chứng & Chuyên khoa', prompt: 'Tôi đang bị đau đầu và chóng mặt, tôi nên khám chuyên khoa nào?' },
  { icon: CalendarClock, label: 'Đặt lịch khám', prompt: 'Tôi muốn đặt lịch khám bệnh' },
  { icon: ClipboardList, label: 'Xem lịch hẹn của tôi', prompt: 'Tôi có lịch hẹn nào sắp tới không?' },
  { icon: MessageCircleHeart, label: 'Tìm bác sĩ theo chuyên khoa', prompt: 'Cho tôi xem danh sách bác sĩ tim mạch' },
  { icon: Activity, label: 'Kiểm tra sức khỏe tổng quát', prompt: 'Tôi muốn đặt lịch khám sức khỏe tổng quát định kỳ' },
  { icon: Pill, label: 'Hỏi về chi phí khám', prompt: 'Chi phí khám bệnh tại phòng khám là bao nhiêu?' },
];

export default function ChatPage() {
  const t = useTranslations('chat');
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
      `Tôi muốn đặt lịch này:`,
      `Bác sĩ: ${slot.doctorName}`,
      `Ngày: ${slot.date} | Giờ: ${slot.startTime} - ${slot.endTime}`,
      slot.roomName ? `Phòng: ${slot.roomName}` : '',
      `<<BOOK doctorId="${slot.doctorId}" slotId="${slot.slotId}" serviceId="${slot.serviceId || 'unknown'}" date="${slot.date}" startTime="${slot.startTime}" endTime="${slot.endTime}">>`,
    ].filter(Boolean);
    sendMessage(lines.join('\n'));
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 selection:bg-[#1392ec]/20">

      {/* Header */}
      <div className="relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 px-4 py-4 flex-shrink-0 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/patient" className="md:hidden p-2 -ml-2 text-slate-500 hover:text-[#1392ec] hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#1392ec] shadow-sm flex-shrink-0">
              <Bot className="h-6 w-6 text-white" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full z-10 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-bold text-slate-900 dark:text-slate-100 text-[16px] leading-tight tracking-tight">{t('title')}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{t('status')}</p>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => void clearChat()}
              className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500 hover:text-[#1392ec] bg-slate-100/80 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition-all active:scale-95"
            >
              <span>+ {t('clearChat')}</span>
            </button>
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
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-[0.2em] uppercase">{t('aiName')} — Gợi ý bắt đầu</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                {QUICK_PROMPTS.map(({ icon: Icon, label, prompt }, i) => (
                  <button
                    key={label}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="group relative flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#1392ec]/30 dark:hover:border-[#1392ec]/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer text-left"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-[#1392ec]/10 flex items-center justify-center group-hover:bg-[#1392ec] transition-all duration-300 shadow-sm">
                      <Icon className="h-6 w-6 text-[#1392ec] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 pt-1">
                      <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#1392ec] transition-colors">
                        {label}
                      </span>
                      <span className="text-[12px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1">
                        Khám phá ngay
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
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-[#1392ec] text-white flex items-center justify-center flex-shrink-0 transition-all shadow-sm active:scale-95 hover:bg-[#1392ec]/90 disabled:opacity-40 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer group"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
