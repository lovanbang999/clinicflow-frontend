"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChatStream } from '@/lib/hooks/useChatStream';
import { MessageBubble } from './MessageBubble';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Send, Bot, X, MessageSquareHeart, MoreVertical, Smile, PlusCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const { messages, sendMessage, isLoading, clearChat, reportSession } = useChatStream();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update (smooth during streaming)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 hidden md:flex flex-col items-end pointer-events-none">
      {isOpen && (
        <div className="w-[380px] sm:w-[420px] h-[600px] max-h-[80vh] flex flex-col bg-background rounded-[24px] shadow-[0_24px_48px_rgba(73,95,139,0.12)] overflow-hidden pointer-events-auto animate-in zoom-in-[0.8] fade-in slide-in-from-bottom-4 origin-bottom-right duration-300 ease-out border">
          {/* Header */}
          <header className="px-6 py-5 flex items-center justify-between bg-blue-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                <Bot className="h-6 w-6" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white/50 rounded-full"></span>
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight leading-none">{t('title')}</h1>
                <p className="text-xs text-primary-foreground/80 mt-1 font-medium">{t('status')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer outline-none">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuItem onClick={clearChat} className="cursor-pointer gap-2 py-2.5">
                    <PlusCircle className="h-4 w-4" />
                    {t('clearChat')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 text-orange-600 focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950" onClick={() => reportSession()}>
                    <AlertTriangle className="h-4 w-4" />
                    {t('reportIssue')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-card" ref={scrollRef}>
             <div className="flex flex-col gap-2 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('aiName')}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{t('today')}</span>
                </div>
                <div className="bg-sky-50 dark:bg-muted text-sky-950 dark:text-foreground px-5 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed">
                    {t('welcome')}
                </div>
             </div>
             {messages.map(msg => (
               <MessageBubble key={msg.id} role={msg.role} content={msg.content} isStreaming={msg.isStreaming} />
             ))}
             {/* Sentinel element — scrollIntoView target */}
             <div ref={bottomRef} className="h-px" />
          </div>

          {/* Input Area */}
          <div className="px-6 pb-6 pt-4 bg-slate-50 dark:bg-card">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center bg-muted rounded-2xl p-2 group transition-all focus-within:ring-2 ring-blue-600">
                {/* <button type="button" className="p-2 text-muted-foreground hover:text-blue-600 transition-colors">
                  <PlusCircle className="h-5 w-5" />
                </button> */}
                <input 
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder={t('placeholder')} 
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm py-2 px-1 text-foreground placeholder:text-muted-foreground font-medium" 
                />
                <div className="flex items-center gap-1">
                  <button type="button" className="p-2 text-muted-foreground hover:text-blue-600 transition-colors cursor-pointer">
                    <Smile className="h-5 w-5" />
                  </button>
                  <button type="submit" disabled={!input.trim() || isLoading} className="cursor-pointer disabled:cursor-default w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform disabled:opacity-50 hover:bg-blue-700">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </form>
            <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium italic">
                {t('warning')}
            </p>
          </div>
        </div>
      )}

      {/* FAB Support */}
      {!isOpen && (
        <div className="flex items-end gap-3 pointer-events-auto group animate-in fade-in zoom-in duration-300">
          <div className="bg-background/80 backdrop-blur-md px-4 py-3 border rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer transition-all duration-300 opacity-0 translate-x-4 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto hover:bg-muted/50" onClick={() => setIsOpen(true)}>
            <div className="text-right">
              <p className="text-xs font-bold text-foreground">{t('ctaTitle')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t('ctaSubtitle')}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_12px_24px_rgba(73,95,139,0.3)] hover:scale-105 active:scale-95 transition-all p-0 bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            <MessageSquareHeart className="h-8 w-8" />
          </Button>
        </div>
      )}
    </div>
  );
}
