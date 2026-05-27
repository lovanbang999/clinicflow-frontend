'use client';

import React from 'react';
import { Bot, MessageSquare, Plus, CheckCircle2, Clock, X, ChevronLeft, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Link, useRouter } from '@/i18n/navigation';
import type { AiSessionSummary } from '@/lib/api/ai';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';

interface ChatSidebarProps {
  sessions: AiSessionSummary[];
  isLoading: boolean;
  activeSessionId: string | null; // current URL sessionId or null (new chat)
  onClose: () => void;
  isOpen: boolean;
  onNewChat: () => void;
}

function getOutcomeBadge(outcome: AiSessionSummary['outcome']) {
  switch (outcome) {
    case 'BOOKING_MADE':
      return { icon: CheckCircle2, color: 'text-emerald-500' };
    case 'ONGOING':
      return { icon: Clock, color: 'text-blue-500' };
    case 'REPORTED':
      return { icon: X, color: 'text-rose-500' };
    default:
      return { icon: MessageSquare, color: 'text-slate-400' };
  }
}

function groupByDate(sessions: AiSessionSummary[] = []) {
  const groups: { label: string; items: AiSessionSummary[] }[] = [];
  const today: AiSessionSummary[] = [];
  const yesterday: AiSessionSummary[] = [];
  const week: AiSessionSummary[] = [];
  const older: AiSessionSummary[] = [];

  if (!Array.isArray(sessions)) return groups;

  sessions.forEach((s) => {
    const d = parseISO(s.startedAt);
    if (isToday(d)) today.push(s);
    else if (isYesterday(d)) yesterday.push(s);
    else if (Date.now() - d.getTime() < 7 * 86_400_000) week.push(s);
    else older.push(s);
  });

  if (today.length > 0) groups.push({ label: 'groupToday', items: today });
  if (yesterday.length > 0) groups.push({ label: 'groupYesterday', items: yesterday });
  if (week.length > 0) groups.push({ label: 'groupLast7Days', items: week });
  if (older.length > 0) groups.push({ label: 'groupOlder', items: older });

  return groups;
}

export function ChatSidebar({
  sessions = [],
  isLoading,
  activeSessionId,
  isOpen,
  onClose,
  onNewChat,
}: ChatSidebarProps) {
  const router = useRouter();
  const groups = groupByDate(sessions);
  const t = useTranslations('chat');

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-[1px]"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-40 md:z-auto',
          'w-[260px] flex-shrink-0 flex flex-col h-full',
          'bg-white border-r border-slate-200/80',
          'transition-transform duration-300 ease-out md:translate-x-0',
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 flex-shrink-0">
          <Link
            href="/patient/chat"
            onClick={onNewChat}
            className="flex items-center gap-3 group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1392ec] to-[#0e7bcc] flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105">
              <Bot className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-800 leading-none">SmartClinic AI</p>
              <p className="text-[11px] text-slate-400 mt-1">{t('healthAssistant')}</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-slate-600 rounded-lg w-8 h-8 flex items-center justify-center p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              onNewChat();
              router.push('/patient/chat');
              onClose();
            }}
            className="w-full justify-start gap-2.5 px-3 h-10 rounded-xl text-[13px] font-semibold cursor-pointer group"
          >
            <Plus className="h-4 w-4 text-slate-400 group-hover:text-[#1392ec] transition-colors" />
            {t('newChat')}
          </Button>
        </div>

        {/* Session list using Shadcn ScrollArea */}
        <ScrollArea className="flex-1 px-3 pb-4">
          <div className="space-y-4 w-[234px]">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
              </div>
            )}

            {!isLoading && sessions.length === 0 && (
              <div className="text-center px-4 py-8">
                <MessageSquare className="h-7 w-7 text-slate-300 mx-auto mb-3" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t('noSessions')}
                </p>
              </div>
            )}

            {groups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t(group.label)}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((s) => {
                    const badge = getOutcomeBadge(s.outcome);
                    const BadgeIcon = badge.icon;
                    const isActive = s.id === activeSessionId;
                    const preview = s.firstMessage
                      ? s.firstMessage.replace(/\s+/g, ' ').trim()
                      : t('newChat');
                    const time = format(parseISO(s.startedAt), 'HH:mm', { locale: vi });

                    return (
                      <Link
                        key={s.id}
                        href={`/patient/chat/${s.id}`}
                        onClick={onClose}
                        className={cn(
                          'flex items-start gap-2.5 w-full px-3 py-2.5 rounded-xl group',
                          'transition-all duration-150 cursor-pointer border',
                          isActive
                            ? 'bg-[#1392ec]/8 border-[#1392ec]/15 shadow-[0_1px_2px_rgba(19,146,236,0.05)]'
                            : 'hover:bg-slate-50 border-transparent',
                        )}
                      >
                        <BadgeIcon
                          className={cn(
                            'h-3.5 w-3.5 mt-0.5 flex-shrink-0 transition-colors',
                            isActive ? badge.color : 'text-slate-400 group-hover:' + badge.color,
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-[12px] leading-snug truncate transition-colors',
                              isActive ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900',
                            )}
                          >
                            {preview}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">{time}</span>
                            {s.messageCount > 0 && (
                              <>
                                <span className="text-[10px] text-slate-300">·</span>
                                <span className="text-[10px] text-slate-400">
                                  {t('messagesCount', { count: s.messageCount })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-100 flex-shrink-0">
          <Link
            href="/patient"
            className="flex items-center gap-2 text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {t('backToPatientPage')}
          </Link>
        </div>
      </aside>
    </>
  );
}
