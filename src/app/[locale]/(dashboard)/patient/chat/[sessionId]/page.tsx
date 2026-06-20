'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useAiSessionMessages } from '@/lib/hooks/core/useAiHistory';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { format, parseISO } from 'date-fns';
import { vi as viLocale } from 'date-fns/locale';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  MessageSquare,
  Menu,
  Plus,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { useChatLayout } from '../layout';
import { useTranslations } from 'next-intl';

function OutcomeBadge({ outcome }: { outcome: string }) {
  const t = useTranslations('chat');
  const map: Record<string, { labelKey: string; icon: React.ElementType; cls: string }> = {
    BOOKING_MADE: { labelKey: 'outcomeBookingMade', icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
    ONGOING: { labelKey: 'outcomeOngoing', icon: Clock, cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
    ABANDONED: { labelKey: 'outcomeAbandoned', icon: MessageSquare, cls: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
    REPORTED: { labelKey: 'outcomeReported', icon: X, cls: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' },
  };
  const cfg = map[outcome] ?? map.ABANDONED;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border', cfg.cls)}>
      <Icon className="h-3 w-3" />
      {t(cfg.labelKey)}
    </span>
  );
}

export default function SessionHistoryPage() {
  const t = useTranslations('chat');
  const params = useParams();
  const { setSidebarOpen } = useChatLayout();
  const sessionId = typeof params?.sessionId === 'string' ? params.sessionId : null;
  const { detail, isLoading } = useAiSessionMessages(sessionId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#1392ec]" />
        <p className="text-[13px] font-medium">{t('loadingHistory')}</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
        <AlertCircle className="h-8 w-8 text-slate-300" />
        <p className="text-[13px] font-medium">{t('sessionNotFound')}</p>
        <Link href="/patient/chat" className="text-[12px] text-[#1392ec] hover:underline">
          {t('backToChat')}
        </Link>
      </div>
    );
  }

  const { session, messages } = detail;

  // Map messages to MessageBubble format (only USER + MODEL)
  const visibleMessages = messages.filter((m) => m.role === 'USER' || m.role === 'MODEL');

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] dark:bg-slate-950 selection:bg-[#1392ec]/20">

      {/* Header - Hidden on Desktop to avoid redundancy with the sidebar */}
      <div className="relative z-10 md:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 px-3 py-3 flex-shrink-0 sticky top-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="p-1 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 h-9 w-9 flex-shrink-0"
              aria-label={t('openHistory')}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 min-w-0 ml-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="font-bold text-slate-900 dark:text-slate-100 text-[14px] leading-tight tracking-tight truncate">
                  {t('chatDetails')}
                </h1>
                <OutcomeBadge outcome={session.outcome} />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium truncate">
                {format(parseISO(session.startedAt), t('timeFormatString'), { locale: viLocale })}
              </p>
            </div>
          </div>

          {/* Read-only badge */}
          <span className="inline-flex items-center text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-wider flex-shrink-0">
            {t('readOnly')}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pt-6 pb-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* AI welcome stub */}
          <div className="flex flex-col gap-1.5 max-w-[85%] mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold text-blue-600 tracking-wide">{t('aiName')}</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                {format(parseISO(session.startedAt), 'HH:mm', { locale: viLocale })}
              </span>
            </div>
            <div className="w-fit bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-5 py-3.5 rounded-[20px] rounded-tl-[4px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-700/50 text-[15px] leading-relaxed">
              {t('welcome')}
            </div>
          </div>

          {/* All messages */}
          {visibleMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              role={msg.role === 'USER' ? 'user' : 'model'}
              content={msg.content}
              isStreaming={false}
            />
          ))}

          {visibleMessages.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-[13px]">{t('noMessages')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Read-only footer */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <AlertCircle className="h-4 w-4 text-[#1392ec] flex-shrink-0" />
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
            {t('readOnlyRecord')}
          </span>
        </div>
        <Link
          href="/patient/chat"
          className={cn(
            buttonVariants({ variant: 'default', size: 'sm' }),
            "w-full sm:w-auto bg-[#1392ec] hover:bg-[#0e7bcc] text-white rounded-xl gap-1.5 font-bold shadow-sm cursor-pointer transition-all duration-150 active:scale-95 text-[12px] h-9"
          )}
        >
          <Plus className="h-4 w-4" />
          {t('startNewChat')}
        </Link>
      </div>
    </div>
  );
}
