'use client';

import { useEffect, useState, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { format, isValid } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import {
  CalendarBlankIcon,
  CheckIcon,
  XIcon,
  UserIcon,
  ChatTextIcon,
  ClockIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { schedulesApi } from '@/lib/api/appointment/schedules';
import { toast } from 'sonner';
import { OffDay } from '@/types';

interface PendingOffDay extends OffDay {
  doctor: {
    id: string;
    fullName: string;
    email: string;
  };
}

export function AdminLeaveRequests() {
  const [requests, setRequests] = useState<PendingOffDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(false);
  const locale = useLocale();
  const dateLocale = locale === 'vi' ? vi : enUS;
  const t = useTranslations('adminSchedules.leaveRequests');

  const loadRequests = useCallback(async (showSilence = false) => {
    if (!showSilence) {
      setLoading(true);
    }
    try {
      const data = await schedulesApi.getPendingOffDays() as PendingOffDay[];
      setRequests(data || []);
    } catch {
      toast.error(t('toast.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onApprove = async (id: string) => {
    setActionInProgress(true);
    try {
      await schedulesApi.approveOffDay(id);
      toast.success(t('toast.approveSuccess'));
      await loadRequests(true);
    } catch {
      toast.error(t('toast.approveError'));
    } finally {
      setActionInProgress(false);
    }
  };

  const onReject = async (id: string) => {
    setActionInProgress(true);
    try {
      await schedulesApi.rejectOffDay(id);
      toast.success(t('toast.rejectSuccess'));
      await loadRequests(true);
    } catch {
      toast.error(t('toast.rejectError'));
    } finally {
      setActionInProgress(false);
    }
  };

  return (
    <Card className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-100 dark:border-amber-800/30">
            <CalendarBlankIcon size={20} weight="duotone" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('title')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('description')}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs border-amber-200 bg-amber-50/50 text-amber-700 font-semibold px-2 py-0.5">
          {t('pendingCount', { count: requests.length })}
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <SpinnerIcon size={32} className="animate-spin text-[#1392ec] mb-3" />
          <span className="text-sm font-medium">{t('loading')}</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10">
          <CalendarBlankIcon size={40} className="text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 text-center">
            {t('empty.title')}
          </p>
          <p className="text-xs text-slate-400 text-center mt-1">
            {t('empty.description')}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          {requests.map((req) => {
            const reqDate = new Date(req.date);
            const formattedDate = isValid(reqDate)
              ? format(reqDate, 'EEEE, dd/MM/yyyy', { locale: dateLocale })
              : req.date;

            return (
              <div
                key={req.id}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all"
              >
                <div className="flex gap-3 items-start">
                  <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 font-bold shrink-0">
                    {req.doctor?.fullName ? req.doctor.fullName.charAt(0).toUpperCase() : <UserIcon size={20} />}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {t('doctorLabel', { name: req.doctor?.fullName || t('unknown') })}
                      </h4>
                      <span className="text-[11px] text-slate-400">({req.doctor?.email})</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <ClockIcon size={14} className="text-[#1392ec]" />
                      <span>{t('dateLabel')}:</span>
                      <span className="text-slate-800 dark:text-slate-200">{formattedDate}</span>
                    </div>

                    {req.reason && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-500 max-w-md">
                        <ChatTextIcon size={14} className="text-slate-400 mt-0.5 shrink-0" />
                        <span className="italic break-words">&ldquo;{req.reason}&rdquo;</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 justify-end shrink-0">
                  <Button
                    size="sm"
                    disabled={actionInProgress}
                    onClick={() => onReject(req.id)}
                    className="h-8 px-3 rounded-lg border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-semibold text-xs flex items-center gap-1 cursor-pointer bg-transparent shadow-none"
                  >
                    <XIcon size={14} weight="bold" />
                    {t('btn.reject')}
                  </Button>
                  <Button
                    size="sm"
                    disabled={actionInProgress}
                    onClick={() => onApprove(req.id)}
                    className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <CheckIcon size={14} weight="bold" />
                    {t('btn.approve')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
