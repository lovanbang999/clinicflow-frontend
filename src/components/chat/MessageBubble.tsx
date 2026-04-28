"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslations } from 'next-intl';
import { CheckCheck } from 'lucide-react';
import { SlotPicker } from './SlotPicker';
import type { Slot } from './SlotPicker';
import type { SlotData, SlotMetadata } from '@/lib/hooks/core/useChatStream';

interface MessageBubbleProps {
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
  slots?: SlotData[];
  slotsMetadata?: SlotMetadata;
  onSelectSlot?: (slot: Slot) => void;
  variant?: 'default' | 'compact';
}

export function MessageBubble({ role, content, isStreaming, slots, slotsMetadata, onSelectSlot, variant = 'default' }: MessageBubbleProps) {
  const t = useTranslations('chat');
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5 ml-auto max-w-[85%] animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">{t('today')}</span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{t('you')}</span>
        </div>
        <div className="bg-[#1392ec] text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm text-[15px] leading-relaxed font-medium">
          {content.split('(SYSTEM:')[0].trim()}
        </div>
        <div className="flex items-center gap-1 px-1">
          <CheckCheck className="h-3.5 w-3.5 text-[#1392ec]" />
          <span className="text-[10px] text-slate-400 font-medium">{t('seen')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 max-w-[85%] animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[11px] font-bold text-[#1392ec] uppercase tracking-wider">{t('aiName')}</span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t('today')}</span>
      </div>
      <div className="w-fit bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-[0_4px_15px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)] border border-slate-100/80 dark:border-slate-700/50 text-[15px] leading-relaxed max-w-full font-medium">
        {content ? (
          isStreaming ? (
            <span className="whitespace-pre-wrap break-words">
              {content}
              <span className="inline-block w-1.5 h-4 ml-1 bg-[#1392ec] animate-pulse align-middle" aria-hidden="true" />
            </span>
          ) : (
            <div className="prose prose-slate dark:prose-invert prose-p:my-1.5 prose-headings:my-2.5 prose-ul:my-1.5 prose-li:my-0 max-w-none break-words text-[15px] font-medium leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 h-6 pt-1 px-1">
            <div className="w-1.5 h-1.5 bg-[#1392ec]/40 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-[#1392ec]/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-1.5 h-1.5 bg-[#1392ec] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        )}

        {!isStreaming && slots && slots.length > 0 && onSelectSlot && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <SlotPicker
              slots={slots as Slot[]}
              onSelectSlot={onSelectSlot}
              variant={variant}
              fallbackMessage={slotsMetadata?.isFallbackSuggestions ? slotsMetadata.message : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}
