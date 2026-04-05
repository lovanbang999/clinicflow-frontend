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
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-muted-foreground uppercase">{t('today')}</span>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t('you')}</span>
        </div>
        <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md text-sm leading-relaxed">
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
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('aiName')}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{t('today')}</span>
      </div>
      <div className="w-fit bg-sky-50 dark:bg-muted text-sky-950 dark:text-foreground px-5 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm leading-relaxed">
        {content ? (
          isStreaming ? (
            // During stream: plain pre-wrap text — no heavy markdown re-parsing each chunk
            <span className="whitespace-pre-wrap break-words">
              {content}
              <span className="streaming-cursor" aria-hidden="true" />
            </span>
          ) : (
            // Stream done: render full markdown
            <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 max-w-none break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )
        ) : (
          // Typing indicator dots
          <div className="flex items-center gap-1.5 h-5 pt-1">
            <div className="w-1.5 h-1.5 bg-blue-600/60 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-blue-600/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-1.5 h-1.5 bg-blue-600/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
      </div>
    </div>
  );
}
