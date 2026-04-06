"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslations } from 'next-intl';
import { CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const t = useTranslations('chat');
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-2 ml-auto max-w-[85%]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{t('today')}</span>
          <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 tracking-wide">{t('you')}</span>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white px-5 py-3 rounded-[20px] rounded-tr-[4px] shadow-sm text-[15px] leading-relaxed">
          {content}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[10px] text-muted-foreground">{t('seen')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-[85%]">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-semibold text-blue-600 tracking-wide">{t('aiName')}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{t('today')}</span>
      </div>
      <div className="w-fit bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-5 py-3.5 rounded-[20px] rounded-tl-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 text-[15px] leading-relaxed max-w-full">
        {content ? (
          isStreaming ? (
            // During stream: plain pre-wrap text — no heavy markdown re-parsing each chunk
            <span className="whitespace-pre-wrap break-words">
              {content}
              <span className="streaming-cursor" aria-hidden="true" />
            </span>
          ) : (
            // Stream done: render full markdown
            <div className="prose prose-slate dark:prose-invert prose-p:my-1.5 prose-headings:my-2.5 prose-ul:my-1.5 prose-li:my-0 max-w-none break-words text-[15px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )
        ) : (
          // Typing indicator dots
          <div className="flex items-center gap-1.5 h-6 pt-1 px-1">
            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </div>
    </div>
  );
}
